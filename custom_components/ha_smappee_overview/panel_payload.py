"""Full panel WebSocket payload including schema v2 extras."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_COUNTRY_CODE,
    CONF_DEBUG_SESSION_JSON_KEYS,
    CONF_UPDATE_INTERVAL,
    DEFAULT_UPDATE_INTERVAL,
)
from .coordinator import SmappeeOverviewCoordinator
from .models import ChargingSession, EVCharger, ReimbursementConfig, TariffInfo
from .panel_entity_map import build_entity_map
from .panel_serialize import panel_data_dict, session_to_dict


def _effective_mode_from_session(s: ChargingSession) -> str | None:
    st = (s.status or "").upper()
    if st in ("CHARGING", "STARTED"):
        return "charging"
    if "PAUSE" in st or st == "PAUSED":
        return "paused"
    if st in ("COMPLETED", "STOPPED", "ENDED"):
        return "ended"
    raw_mode = s.raw.get("mode") or s.raw.get("chargingMode")
    if raw_mode:
        return str(raw_mode).lower()
    return None


def _enrich_session(
    s: ChargingSession,
    tariff_per_kwh: float | None,
    reim_rate: float | None,
    belgium_cap: float | None,
) -> dict[str, Any]:
    base = session_to_dict(s)
    base["user_id"] = s.user_id
    base["user_label"] = s.user_label
    base["card_label"] = s.card_label
    base["user_display"] = s.user_label or s.user_id
    base["cost_api_amount"] = s.cost_amount
    base["cost_api_currency"] = s.cost_currency
    base["tariff_id"] = s.tariff_id
    base["effective_mode"] = _effective_mode_from_session(s)
    kwh = (s.energy_wh or 0) / 1000.0 if s.energy_wh else None
    base["cost_estimate"] = None
    base["reimbursement_estimate"] = None
    base["solar_savings_estimate"] = None
    if kwh is not None and kwh > 0:
        if tariff_per_kwh is not None:
            base["cost_estimate"] = round(kwh * tariff_per_kwh, 4)
        rate = reim_rate
        if rate is not None and belgium_cap is not None:
            rate = min(rate, belgium_cap)
        if rate is not None:
            base["reimbursement_estimate"] = round(kwh * rate, 4)
        if tariff_per_kwh is not None and s.solar_share_pct is not None:
            base["solar_savings_estimate"] = round(
                kwh * tariff_per_kwh * (s.solar_share_pct / 100.0), 4
            )
    return base


def _primary_tariff(tariffs: list[TariffInfo]) -> float | None:
    if not tariffs:
        return None
    t0 = tariffs[0]
    return float(t0.price_per_kwh) if t0.price_per_kwh is not None else None


def _tariff_primary_dict(tariffs: list[TariffInfo]) -> dict[str, Any] | None:
    if not tariffs:
        return None
    t = tariffs[0]
    return {
        "id": t.id,
        "name": t.name,
        "currency": t.currency,
        "price_per_kwh": t.price_per_kwh,
    }


def _today_bounds_utc() -> tuple[datetime, datetime]:
    now = datetime.now(UTC)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start, now


def _session_in_range(
    s: ChargingSession, start: datetime, end: datetime
) -> bool:
    if s.start is None:
        return False
    t = s.start
    if t.tzinfo is None:
        t = t.replace(tzinfo=UTC)
    return start <= t <= end


def _compute_today_economics(
    sessions: list[ChargingSession],
    reim_rate: float | None,
    belgium_cap: float | None,
) -> tuple[float, float]:
    start, end = _today_bounds_utc()
    total_kwh = 0.0
    for s in sessions:
        if not _session_in_range(s, start, end):
            continue
        if s.energy_wh:
            total_kwh += s.energy_wh / 1000.0
    rate = reim_rate
    if rate is not None and belgium_cap is not None:
        rate = min(rate, belgium_cap)
    pending = total_kwh * rate if rate is not None else 0.0
    return round(total_kwh, 4), round(pending, 2)


def _raw_excerpt(raw: dict[str, Any], max_keys: int = 30) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for i, (k, v) in enumerate(raw.items()):
        if i >= max_keys:
            out["_truncated"] = True
            break
        if isinstance(v, (dict, list)) and len(str(v)) > 200:
            out[str(k)] = f"<{type(v).__name__} len={len(v)}>"
        else:
            out[str(k)] = v
    return out


def _compute_month_smart_savings_eur(
    sessions: list[ChargingSession],
    tariff_per_kwh: float | None,
    month_yyyy_mm: str,
    currency: str,
) -> dict[str, Any]:
    """Sum estimated solar-based tariff savings for sessions in calendar month (UTC)."""
    if tariff_per_kwh is None:
        return {
            "total_eur": 0.0,
            "sessions_count": 0,
            "currency": currency,
        }
    total = 0.0
    count = 0
    for s in sessions:
        if s.start is None or s.start.strftime("%Y-%m") != month_yyyy_mm:
            continue
        kwh = (s.energy_wh or 0) / 1000.0
        if kwh <= 0 or s.solar_share_pct is None:
            continue
        total += kwh * tariff_per_kwh * (s.solar_share_pct / 100.0)
        count += 1
    return {
        "total_eur": round(total, 4),
        "sessions_count": count,
        "currency": currency,
    }


def _pause_explanation(status: str, connector_mode: str) -> dict[str, str]:
    st = (status or "").upper()
    mode = (connector_mode or "").upper()
    if mode == "PAUSED" or "PAUSED" in st or "PAUSE" in st:
        if any(x in st for x in ("SMART", "WAIT", "SOLAR", "DEFER")):
            return {
                "code": "smart_or_solar_wait",
                "title": "Paused by smart / solar logic",
                "detail": (
                    "Charging is paused while smart or solar mode waits for "
                    "favourable grid or solar conditions. Check the Smappee app "
                    "for the exact rule."
                ),
            }
        return {
            "code": "wallbox_paused",
            "title": "Charging paused",
            "detail": (
                "The connector is in PAUSED mode or the session was paused "
                "(manual stop from app or Home Assistant)."
            ),
        }
    if any(x in st for x in ("WAIT", "DEFER", "QUEUED")):
        return {
            "code": "waiting",
            "title": "Waiting to charge",
            "detail": "Session is waiting; Smappee has not started delivery yet.",
        }
    if st in ("CHARGING", "STARTED") or "CHARG" in st:
        return {
            "code": "charging",
            "title": "Charging",
            "detail": "Energy is being delivered. See limit chain below for speed factors.",
        }
    return {
        "code": "unknown",
        "title": "Session status",
        "detail": f"API status: {status or 'unknown'}. Open the Smappee app for details.",
    }


def _parse_load_balance_amps(val: Any, depth: int = 0) -> float | None:
    if depth > 6:
        return None
    if isinstance(val, (int, float)) and 0 < val <= 80:
        return float(val)
    if isinstance(val, dict):
        keys_prio = (
            "availablecurrent",
            "available_current",
            "maxcurrent",
            "max_current",
            "value",
        )
        lower_map = {str(k).lower().replace("_", ""): v for k, v in val.items()}
        for pk in keys_prio:
            pkn = pk.replace("_", "")
            if pkn in lower_map:
                got = _parse_load_balance_amps(lower_map[pkn], depth + 1)
                if got is not None:
                    return got
        for v in val.values():
            got = _parse_load_balance_amps(v, depth + 1)
            if got is not None:
                return got
    if isinstance(val, list):
        for item in val:
            got = _parse_load_balance_amps(item, depth + 1)
            if got is not None:
                return got
    return None


def _find_connector(
    chargers: list[EVCharger], serial: str, position: int
):
    for ch in chargers:
        if ch.serial != serial:
            continue
        for co in ch.connectors:
            if co.position == position:
                return ch, co
    return None, None


def _build_limit_chain(
    current_a: float | None,
    max_hardware_a: float | None,
    connector_mode: str,
    lb_value: Any,
) -> list[dict[str, str]]:
    chain: list[dict[str, str]] = []
    mode_u = (connector_mode or "").upper()
    if max_hardware_a is not None and max_hardware_a > 0:
        chain.append(
            {
                "factor": "hardware_max",
                "label": "Hardware maximum",
                "value": f"{int(max_hardware_a)} A",
                "source": "config",
            }
        )
    lb_amps = _parse_load_balance_amps(lb_value)
    if current_a is not None and current_a > 0:
        chain.append(
            {
                "factor": "set_current",
                "label": "Set current limit",
                "value": f"{int(round(current_a))} A",
                "source": "live",
            }
        )
    if lb_amps is not None:
        chain.append(
            {
                "factor": "load_balance",
                "label": "Load balancing (parsed)",
                "value": f"≤ {lb_amps:.0f} A",
                "source": "estimated",
            }
        )
    if mode_u == "SMART":
        chain.append(
            {
                "factor": "smart_mode",
                "label": "Smart mode",
                "value": "May throttle below set limit",
                "source": "estimated",
            }
        )
    elif mode_u == "NORMAL" and lb_amps is None:
        chain.append(
            {
                "factor": "normal_mode",
                "label": "Standard mode",
                "value": "Typically follows set current unless load balancing applies",
                "source": "estimated",
            }
        )
    return chain


def _sessions_for_ev_hints(
    sessions_active: list[ChargingSession],
    sessions_recent: list[ChargingSession],
    chargers: list[EVCharger],
) -> list[ChargingSession]:
    """Sessions to drive pause/limit hints: active list plus recent open sessions on busy connectors."""
    seen: set[tuple[str, int]] = set()
    out: list[ChargingSession] = []
    for s in sessions_active:
        key = (s.charger_serial, s.connector)
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    covered = {(s.charger_serial, s.connector) for s in out}
    for ch in chargers:
        for co in ch.connectors:
            if not co.session_active:
                continue
            key = (ch.serial, co.position)
            if key in covered:
                continue
            candidates = [
                x
                for x in sessions_recent
                if x.charger_serial == ch.serial and x.connector == co.position
            ]
            candidates.sort(
                key=lambda x: x.start or datetime.min.replace(tzinfo=UTC),
                reverse=True,
            )
            for s in candidates:
                st = (s.status or "").upper()
                if st in ("COMPLETED", "STOPPED", "ENDED"):
                    continue
                out.append(s)
                covered.add(key)
                break
    return out


def _build_active_ev_hints(
    hint_sessions: list[ChargingSession],
    chargers: list[EVCharger],
    charger_features: dict[str, Any],
    chargers_lb: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    lb_by_serial = {x["serial"]: x.get("load_balance", {}) for x in chargers_lb}
    hints: list[dict[str, Any]] = []
    seen: set[tuple[str, int]] = set()
    for s in hint_sessions:
        key = (s.charger_serial, s.connector)
        if key in seen:
            continue
        seen.add(key)
        _ch, co = _find_connector(chargers, s.charger_serial, s.connector)
        mode = co.mode if co else "UNKNOWN"
        feat = charger_features.get(s.charger_serial)
        max_a = float(feat.max_current_a) if feat and feat.max_current_a else None
        cur_a = float(co.current_a) if co and co.current_a is not None else None
        lb_raw = lb_by_serial.get(s.charger_serial, {}).get("value")
        hints.append(
            {
                "session_id": s.id,
                "charger_serial": s.charger_serial,
                "connector": s.connector,
                "status": s.status,
                "connector_mode": mode,
                "pause_explanation": _pause_explanation(s.status or "", mode),
                "limit_chain": _build_limit_chain(cur_a, max_a, mode, lb_raw),
            }
        )
    return hints


def _charger_load_balance(ch) -> dict[str, Any] | None:
    raw = ch.raw or {}
    keys_lower = {str(k).lower(): k for k in raw}
    for candidate in (
        "loadbalancing",
        "load_balancing",
        "overload",
        "maxcurrent",
        "availablecurrent",
    ):
        for lk, orig in keys_lower.items():
            if candidate in lk.replace("_", ""):
                return {
                    "source_key": orig,
                    "value": raw.get(orig),
                    "reported": True,
                }
    return {"reported": False, "value": None}


def build_full_panel_payload(
    hass: HomeAssistant,
    coordinator: SmappeeOverviewCoordinator,
) -> dict[str, Any]:
    """Merge v1 panel dict with schema v2 fields."""
    d = coordinator.data
    entry: ConfigEntry = coordinator.config_entry
    base = panel_data_dict(d)
    opt = entry.options
    country = str(opt.get(CONF_COUNTRY_CODE) or "").strip().upper() or None
    if country == "":
        country = None

    tariff_f = _primary_tariff(d.tariffs)
    reim: ReimbursementConfig | None = d.reimbursement
    reim_rate = float(reim.rate_per_kwh) if reim else None
    cap = float(reim.belgium_cap_eur_per_kwh) if reim and reim.belgium_cap_eur_per_kwh is not None else None

    seen: set[str] = set()
    sessions_enriched: list[dict[str, Any]] = []
    for s in d.sessions_active + d.sessions_recent:
        if s.id in seen:
            continue
        seen.add(s.id)
        sessions_enriched.append(_enrich_session(s, tariff_f, reim_rate, cap))

    today_kwh, today_pending = _compute_today_economics(
        d.sessions_active + d.sessions_recent,
        reim_rate,
        cap,
    )

    belgium_cap_compliant: bool | None = None
    if country == "BE" and reim is not None and reim.belgium_cap_eur_per_kwh is not None:
        belgium_cap_compliant = reim.rate_per_kwh <= reim.belgium_cap_eur_per_kwh

    reim_history: list[dict[str, Any]] = []
    if reim and reim.history:
        for h in reim.history:
            reim_history.append(
                {
                    "valid_from": h.valid_from.isoformat(),
                    "rate_per_kwh": h.rate_per_kwh,
                    "currency": h.currency,
                }
            )

    session_key_union: list[str] | None = None
    if bool(opt.get(CONF_DEBUG_SESSION_JSON_KEYS)):
        u: set[str] = set()
        for s in d.sessions_active + d.sessions_recent:
            u.update(str(k) for k in s.raw)
        session_key_union = sorted(u)

    stale_sections: list[str] = []
    if d.api_partial:
        stale_sections.append("api")
    if d.consumption and d.consumption.stale:
        stale_sections.append("consumption")

    unsupported_connectors: list[dict[str, Any]] = []
    for ch in d.chargers:
        for co in ch.connectors:
            if co.mode == "UNKNOWN":
                feat = d.charger_features.get(ch.serial)
                if feat and not feat.supports_smart_mode:
                    unsupported_connectors.append(
                        {
                            "charger_serial": ch.serial,
                            "connector": co.position,
                            "reason": "mode_unknown_dc_or_limited",
                        }
                    )

    inst = d.installation
    inst_excerpt = _raw_excerpt(inst.raw, 25) if inst and inst.raw else {}

    update_s = int(
        opt.get(CONF_UPDATE_INTERVAL)
        or entry.data.get(CONF_UPDATE_INTERVAL)
        or DEFAULT_UPDATE_INTERVAL
    )

    coordinator_ok = getattr(coordinator, "last_update_success", True)

    chargers_lb = [
        {
            "serial": c.serial,
            "load_balance": _charger_load_balance(c),
        }
        for c in d.chargers
    ]

    month_key = (
        d.reimbursement_monthly.month
        if d.reimbursement_monthly
        else datetime.now(UTC).strftime("%Y-%m")
    )
    savings_currency = "EUR"
    if d.tariffs and d.tariffs[0].currency:
        savings_currency = str(d.tariffs[0].currency)
    elif reim:
        savings_currency = str(reim.currency)

    overview_context: dict[str, Any] = {
        "month_smart_savings": _compute_month_smart_savings_eur(
            list(d.sessions_active) + list(d.sessions_recent),
            tariff_f,
            month_key,
            savings_currency,
        ),
        "active_ev_hints": _build_active_ev_hints(
            _sessions_for_ev_hints(
                list(d.sessions_active),
                list(d.sessions_recent),
                d.chargers,
            ),
            d.chargers,
            d.charger_features,
            chargers_lb,
        ),
    }

    v2: dict[str, Any] = {
        "schema_version": 2,
        "country_code": country,
        "meta": {
            "schema_version": 2,
            "update_interval_s": update_s,
            "coordinator_last_update_success": coordinator_ok,
            "consumption_stale": bool(d.consumption and d.consumption.stale),
        },
        "entity_map": build_entity_map(hass, entry),
        "sessions_enriched": sessions_enriched,
        "economics": {
            "today_kwh": today_kwh,
            "today_pending_eur": today_pending,
            "tariff_primary": _tariff_primary_dict(d.tariffs),
            "tariffs_all": [
                {
                    "id": t.id,
                    "name": t.name,
                    "currency": t.currency,
                    "price_per_kwh": t.price_per_kwh,
                }
                for t in d.tariffs
            ],
            "reimbursement_history": reim_history,
            "belgium_cap_compliant": belgium_cap_compliant,
        },
        "diagnostics": {
            "api_partial": d.api_partial,
            "last_error": d.last_error,
            "installation_features": base.get("installation_features"),
            "charger_features_summary": base.get("charger_features"),
            "unsupported_connectors": unsupported_connectors,
            "stale_sections": stale_sections,
            "installation_raw_excerpt": inst_excerpt,
            "recent_session_errors": [],
            "session_json_keys_union": session_key_union,
        },
        "chargers_extended": chargers_lb,
        "overview_context": overview_context,
    }
    base.update(v2)
    return base
