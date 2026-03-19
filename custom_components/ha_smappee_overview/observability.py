"""Native observability helpers for structured logs, metrics, and alerts."""

from __future__ import annotations

import contextvars
import json
import logging
import time
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

_CORRELATION_ID: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "smappee_correlation_id", default=None
)

_SEVERITY_TO_LEVEL: dict[str, int] = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warning": logging.WARNING,
    "error": logging.ERROR,
    "critical": logging.CRITICAL,
}


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


def new_correlation_id() -> str:
    return uuid.uuid4().hex


def set_correlation_id(correlation_id: str | None) -> contextvars.Token[str | None]:
    return _CORRELATION_ID.set(correlation_id)


def reset_correlation_id(token: contextvars.Token[str | None]) -> None:
    _CORRELATION_ID.reset(token)


def get_correlation_id() -> str | None:
    return _CORRELATION_ID.get()


def log_event(
    logger: logging.Logger,
    *,
    source: str,
    stage: str,
    severity: str,
    message: str,
    correlation_id: str | None = None,
    context: dict[str, Any] | None = None,
) -> None:
    """Emit a structured JSON log record."""
    sev = severity.lower()
    level = _SEVERITY_TO_LEVEL.get(sev, logging.INFO)
    payload = {
        "timestamp": _utc_now_iso(),
        "source": source,
        "pipeline_stage": stage,
        "severity": sev,
        "correlation_id": correlation_id or get_correlation_id(),
        "message": message,
        "context": context or {},
    }
    logger.log(level, json.dumps(payload, default=str, separators=(",", ":")))


@dataclass(slots=True)
class ObservabilityError:
    timestamp: str
    source: str
    stage: str
    severity: str
    kind: str
    message: str
    correlation_id: str | None
    context: dict[str, Any] = field(default_factory=dict)


class ObservabilityStore:
    """In-memory metrics + error timeline + alert evaluation."""

    def __init__(self) -> None:
        self._counters: dict[tuple[str, tuple[tuple[str, str], ...]], float] = (
            defaultdict(float)
        )
        self._latency_ms: dict[tuple[str, tuple[tuple[str, str], ...]], list[float]] = (
            defaultdict(list)
        )
        self._time_events: deque[tuple[float, str, float]] = deque(maxlen=5000)
        self._errors_recent: deque[ObservabilityError] = deque(maxlen=300)
        self._active_alerts: dict[str, dict[str, Any]] = {}
        self._device_last_data_ts: dict[str, float] = {}
        self._connection_status: dict[str, str] = {}
        self._last_data_received_ts: float | None = None

    @staticmethod
    def _labels_key(labels: dict[str, Any] | None) -> tuple[tuple[str, str], ...]:
        if not labels:
            return tuple()
        return tuple(sorted((str(k), str(v)) for k, v in labels.items()))

    def inc(self, name: str, value: float = 1.0, **labels: Any) -> None:
        key = (name, self._labels_key(labels))
        self._counters[key] += value
        now = time.time()
        if name in ("data_processed_total", "errors_total"):
            self._time_events.append((now, name, value))

    def observe_ms(self, name: str, value_ms: float, **labels: Any) -> None:
        key = (name, self._labels_key(labels))
        vals = self._latency_ms[key]
        vals.append(float(value_ms))
        if len(vals) > 500:
            del vals[: len(vals) - 500]

    def mark_data_received(self, source: str, count: int) -> None:
        now = time.time()
        self._last_data_received_ts = now
        self._device_last_data_ts[source] = now
        self.inc("data_received_total", max(count, 0), source=source)

    def mark_data_processed(self, source: str, count: int) -> None:
        self.inc("data_processed_total", max(count, 0), source=source)

    def mark_parse_failure(self, parser: str, source: str) -> None:
        self.inc("failed_parses_total", 1.0, parser=parser, source=source)

    def mark_empty_dataset(self, source: str) -> None:
        self.inc("empty_dataset_responses_total", 1.0, source=source)

    def mark_api_response(
        self,
        *,
        method: str,
        path: str,
        status: int | str,
        latency_ms: float,
    ) -> None:
        self.inc(
            "api_requests_total",
            1.0,
            method=method.upper(),
            path=path,
            status=status,
        )
        self.observe_ms(
            "api_response_time_ms",
            latency_ms,
            method=method.upper(),
            path=path,
            status=status,
        )

    def set_connection_status(self, key: str, status: str) -> None:
        self._connection_status[key] = status

    def mark_device_seen(self, device_id: str) -> None:
        self._device_last_data_ts[device_id] = time.time()

    def capture_error(
        self,
        *,
        source: str,
        stage: str,
        severity: str,
        kind: str,
        message: str,
        correlation_id: str | None,
        context: dict[str, Any] | None = None,
    ) -> ObservabilityError:
        self.inc("errors_total", 1.0, kind=kind, source=source, stage=stage)
        err = ObservabilityError(
            timestamp=_utc_now_iso(),
            source=source,
            stage=stage,
            severity=severity,
            kind=kind,
            message=message,
            correlation_id=correlation_id,
            context=context or {},
        )
        self._errors_recent.append(err)
        return err

    def _rolling_rate(self, metric_name: str, period_s: int = 60) -> float:
        now = time.time()
        total = 0.0
        for ts, name, value in self._time_events:
            if name != metric_name:
                continue
            if now - ts <= period_s:
                total += value
        return total / period_s

    def evaluate_alerts(
        self,
        *,
        no_data_timeout_s: int,
        parse_failure_threshold: int,
        disconnect_threshold_s: int,
        disconnected_devices: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        now = time.time()
        active_keys: set[str] = set()
        out: list[dict[str, Any]] = []

        if self._last_data_received_ts is None or (
            now - self._last_data_received_ts > no_data_timeout_s
        ):
            key = "no_data_timeout"
            active_keys.add(key)
            out.append(
                self._upsert_alert(
                    key=key,
                    severity="warning",
                    title="No data received",
                    message=f"No data received for {no_data_timeout_s}s",
                )
            )

        parse_fail_total = 0.0
        for (name, _labels), value in self._counters.items():
            if name == "failed_parses_total":
                parse_fail_total += value
        if parse_fail_total >= parse_failure_threshold:
            key = "repeated_parse_failures"
            active_keys.add(key)
            out.append(
                self._upsert_alert(
                    key=key,
                    severity="warning",
                    title="Repeated parse failures",
                    message=f"Parse failures reached {int(parse_fail_total)}",
                )
            )

        for device_id, ts in self._device_last_data_ts.items():
            if now - ts > disconnect_threshold_s:
                key = f"device_stale:{device_id}"
                active_keys.add(key)
                out.append(
                    self._upsert_alert(
                        key=key,
                        severity="warning",
                        title="Device disconnected",
                        message=f"{device_id} has no fresh data",
                    )
                )

        for device_id in disconnected_devices or []:
            key = f"device_disconnected:{device_id}"
            active_keys.add(key)
            out.append(
                self._upsert_alert(
                    key=key,
                    severity="warning",
                    title="Device disconnected",
                    message=f"{device_id} is reported disconnected",
                )
            )

        for key, alert in list(self._active_alerts.items()):
            if key in active_keys:
                continue
            if alert.get("active"):
                alert["active"] = False
                alert["resolved_at"] = _utc_now_iso()
            out.append(alert.copy())

        return out

    def _upsert_alert(
        self, *, key: str, severity: str, title: str, message: str
    ) -> dict[str, Any]:
        existing = self._active_alerts.get(key)
        if existing and existing.get("active"):
            return existing.copy()
        ts = _utc_now_iso()
        alert = {
            "id": key,
            "severity": severity,
            "title": title,
            "message": message,
            "active": True,
            "started_at": existing.get("started_at", ts) if existing else ts,
            "resolved_at": None,
        }
        self._active_alerts[key] = alert
        return alert.copy()

    def snapshot(self) -> dict[str, Any]:
        counters: dict[str, float] = {}
        labels: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for (name, label_key), value in self._counters.items():
            counters[name] = counters.get(name, 0.0) + value
            if label_key:
                labels[name].append(
                    {"labels": {k: v for k, v in label_key}, "value": value}
                )

        latency: dict[str, dict[str, float]] = {}
        for (name, label_key), values in self._latency_ms.items():
            if not values:
                continue
            metric_name = (
                f"{name}:{','.join(f'{k}={v}' for k, v in label_key)}"
                if label_key
                else name
            )
            latency[metric_name] = {
                "count": float(len(values)),
                "avg_ms": round(sum(values) / len(values), 3),
                "max_ms": round(max(values), 3),
                "min_ms": round(min(values), 3),
            }

        return {
            "timestamp": _utc_now_iso(),
            "counters": counters,
            "counters_by_label": dict(labels),
            "latency_ms": latency,
            "rates": {
                "data_processed_per_s": round(
                    self._rolling_rate("data_processed_total"), 4
                ),
                "error_rate_per_s": round(self._rolling_rate("errors_total"), 4),
            },
            "last_data_received_at": datetime.fromtimestamp(
                self._last_data_received_ts, UTC
            ).isoformat()
            if self._last_data_received_ts
            else None,
            "device_last_data": {
                k: datetime.fromtimestamp(v, UTC).isoformat()
                for k, v in self._device_last_data_ts.items()
            },
            "connection_status": dict(self._connection_status),
            "recent_errors": [e.__dict__.copy() for e in self._errors_recent],
        }

