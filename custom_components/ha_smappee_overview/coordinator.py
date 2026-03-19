"""Data update coordinator for Smappee Overview."""

from __future__ import annotations

import asyncio
import logging
import os
import time
from collections.abc import Callable
from dataclasses import replace
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .api import SmappeeAPIClient, SmappeeApiError, SmappeeDomainAPI
from .api.auth import SmappeeAuthError
from .api.discovery import iter_device_dicts, merge_discovery
from .api.endpoints import parse_consumption_summary, phase_metrics_has_three_phase
from .const import (
    CONF_CHARGING_PARK_ID_OVERRIDE,
    CONF_DEBUG_SESSION_JSON_KEYS,
    CONF_MAX_SESSION_CHARGERS,
    CONF_SERVICE_LOCATION_ID,
    CONF_SERVICE_LOCATION_NAME,
    CONF_SESSION_HISTORY_DAYS,
    DEFAULT_SESSION_HISTORY_DAYS,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    ENV_MOCK_DATA,
    MAX_SESSION_POLL_CHARGERS,
)
from .coordinator_data import SmappeeCoordinatorData
from .coordinator_merge import merge_charger_features
from .models import (
    ChargingSession,
    ConsumptionSummary,
    EVCharger,
    Installation,
    InstallationFeatures,
    ReimbursementConfig,
    ReimbursementSummary,
)
from .mock_data import (
    build_mock_chargers,
    build_mock_consumption,
    build_mock_installation,
    build_mock_reimbursement,
    build_mock_sessions,
    build_mock_tariffs,
)
from .observability import (
    ObservabilityStore,
    log_event,
    new_correlation_id,
    reset_correlation_id,
    set_correlation_id,
)
from .panel_serialize import panel_data_dict as build_panel_data_dict

_LOGGER = logging.getLogger(__name__)


class SmappeeOverviewCoordinator(DataUpdateCoordinator[SmappeeCoordinatorData]):
    """Poll Smappee cloud API."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        client: SmappeeAPIClient,
    ) -> None:
        self.config_entry = entry
        self.client = client
        self._api = SmappeeDomainAPI(client)
        self._service_location_id = int(entry.data[CONF_SERVICE_LOCATION_ID])
        self._push_listeners: list[Callable[[SmappeeCoordinatorData], None]] = []
        self._discovery_detail_done: bool = False
        self._discovery_ever_fetched_detail: bool = False
        update_interval = timedelta(
            seconds=int(
                entry.options.get("update_interval")
                or entry.data.get("update_interval")
                or DEFAULT_UPDATE_INTERVAL
            )
        )
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=update_interval,
        )
        self.data = SmappeeCoordinatorData()
        self.observability = ObservabilityStore()
        self.observability_alerts: list[dict[str, Any]] = []

    def register_push_listener(
        self, callback: Callable[[SmappeeCoordinatorData], None]
    ) -> Callable[[], None]:
        """Register for future MQTT/push updates; returns unsubscribe."""

        self._push_listeners.append(callback)

        def _unsub() -> None:
            if callback in self._push_listeners:
                self._push_listeners.remove(callback)

        return _unsub

    async def push_update(self, patch: dict[str, Any]) -> None:
        """Merge push/MQTT payload into coordinator data (best-effort)."""
        cid = new_correlation_id()
        token = set_correlation_id(cid)
        data = self.data
        try:
            if "consumption" in patch and isinstance(patch["consumption"], dict):
                c = parse_consumption_summary(patch["consumption"], stale=False)
                self.observability.mark_data_received("push_consumption", 1)
                self.observability.mark_data_processed("push_consumption", 1)
                data = SmappeeCoordinatorData(
                    installation=data.installation,
                    installation_features=data.installation_features,
                    charger_features=data.charger_features,
                    consumption=c,
                    chargers=data.chargers,
                    sessions_active=data.sessions_active,
                    sessions_recent=data.sessions_recent,
                    tariffs=data.tariffs,
                    alerts=data.alerts,
                    reimbursement=data.reimbursement,
                    reimbursement_monthly=data.reimbursement_monthly,
                    last_successful_update=datetime.now(UTC),
                    last_error=data.last_error,
                    api_partial=data.api_partial,
                    backend_health=data.backend_health,
                    validation_warnings=data.validation_warnings,
                    mock_mode=data.mock_mode,
                    discovery=data.discovery,
                    discovery_last_observed=data.discovery_last_observed,
                )
            self.async_set_updated_data(data)
            for cb in list(self._push_listeners):
                try:
                    cb(data)
                except Exception as err:  # noqa: BLE001
                    self.observability.capture_error(
                        source=__name__,
                        stage="push_listener",
                        severity="error",
                        kind="unexpected",
                        message=str(err),
                        correlation_id=cid,
                    )
                    log_event(
                        _LOGGER,
                        source=__name__,
                        stage="push_listener",
                        severity="error",
                        message="push listener failed",
                        correlation_id=cid,
                        context={"error": repr(err)},
                    )
        finally:
            reset_correlation_id(token)

    def mark_charger_availability_api_unsupported(self, serial: str) -> None:
        """Call when PATCH available fails."""
        cf = self.data.charger_features.get(serial)
        if cf:
            cf.supports_availability_patch = False
        self.async_update_listeners()

    def mark_charger_led_supported(self, serial: str, supported: bool) -> None:
        cf = self.data.charger_features.get(serial)
        if cf:
            cf.supports_led_brightness = supported

    async def _maybe_enrich_installation_devices(
        self, installation: Installation | None
    ) -> Installation | None:
        """Merge GET servicelocation/{id} when the list payload has no device entries."""
        if installation is None:
            return None
        raw = installation.raw if isinstance(installation.raw, dict) else {}
        if iter_device_dicts(raw):
            return installation
        if self._discovery_detail_done:
            return installation
        detail = await self._api.get_service_location_detail(self._service_location_id)
        self._discovery_detail_done = True
        self._discovery_ever_fetched_detail = True
        if detail is None:
            return installation
        merged = {**raw, **detail}
        return replace(installation, raw=merged)

    async def _async_update_data(self) -> SmappeeCoordinatorData:
        refresh_started = time.perf_counter()
        correlation_id = new_correlation_id()
        token = set_correlation_id(correlation_id)
        partial = False
        last_err: str | None = None
        installation = self.data.installation
        section_health: dict[str, str] = {}
        validation_warnings: list[str] = []
        self.observability.set_connection_status("api", "updating")
        log_event(
            _LOGGER,
            source=__name__,
            stage="coordinator.refresh.start",
            severity="info",
            message="starting refresh cycle",
            correlation_id=correlation_id,
            context={"entry_id": self.config_entry.entry_id},
        )

        if installation is None:
            try:
                locations = await self._api.list_service_locations()
                self.observability.mark_data_received("service_locations", len(locations))
            except SmappeeAuthError as err:
                self.observability.capture_error(
                    source=__name__,
                    stage="coordinator.list_service_locations",
                    severity="error",
                    kind="auth",
                    message=str(err),
                    correlation_id=correlation_id,
                )
                raise ConfigEntryAuthFailed(str(err)) from err
            except (SmappeeApiError, OSError, TimeoutError) as err:
                installation = Installation(
                    id=self._service_location_id,
                    name=self.config_entry.data.get(CONF_SERVICE_LOCATION_NAME, "Smappee"),
                )
                partial = True
                last_err = str(err)
                self.observability.capture_error(
                    source=__name__,
                    stage="coordinator.list_service_locations",
                    severity="warning",
                    kind="transport",
                    message=str(err),
                    correlation_id=correlation_id,
                )
            else:
                installation = next(
                    (l for l in locations if l.id == self._service_location_id),
                    None,
                )
                if installation is None:
                    installation = Installation(
                        id=self._service_location_id,
                        name=self.config_entry.data.get(
                            CONF_SERVICE_LOCATION_NAME, "Smappee"
                        ),
                    )

        pif = self.data.installation_features
        inst_features = InstallationFeatures(
            tariffs_available=pif.tariffs_available,
            alerts_available=pif.alerts_available,
            has_three_phase=pif.has_three_phase,
        )
        charger_features_prev = dict(self.data.charger_features)

        async def load_consumption() -> ConsumptionSummary:
            return await self._api.get_energy_snapshot(self._service_location_id)

        async def load_chargers() -> list[EVCharger]:
            return await self._api.list_charging_stations(self._service_location_id)

        async def load_tariffs() -> tuple[Any, Any]:
            return await self._api.list_tariffs(self._service_location_id)

        async def load_alerts() -> tuple[Any, Any]:
            return await self._api.list_alerts(self._service_location_id)

        consumption: ConsumptionSummary | None = self.data.consumption
        chargers: list[EVCharger] = self.data.chargers
        tariffs = list(self.data.tariffs)
        alerts_list = list(self.data.alerts)

        c_res, ch_res, t_res, a_res = await asyncio.gather(
            load_consumption(),
            load_chargers(),
            load_tariffs(),
            load_alerts(),
            return_exceptions=True,
        )

        for res in (c_res, ch_res, t_res, a_res):
            if isinstance(res, SmappeeAuthError):
                self.observability.capture_error(
                    source=__name__,
                    stage="coordinator.parallel_fetch",
                    severity="error",
                    kind="auth",
                    message=str(res),
                    correlation_id=correlation_id,
                )
                self.config_entry.async_start_reauth(self.hass)
                raise ConfigEntryAuthFailed(str(res)) from res

        if isinstance(c_res, Exception):
            last_err = str(c_res)
            partial = True
            consumption = self.data.consumption
            section_health["consumption"] = f"error:{type(c_res).__name__}"
            self.observability.capture_error(
                source=__name__,
                stage="coordinator.load_consumption",
                severity="warning",
                kind="transport",
                message=str(c_res),
                correlation_id=correlation_id,
            )
        else:
            consumption = c_res
            section_health["consumption"] = (
                "stale" if consumption and consumption.stale else "ok"
            )
            self.observability.mark_data_received("consumption", 1)
            self.observability.mark_data_processed("consumption", 1)

        if isinstance(ch_res, Exception):
            last_err = last_err or str(ch_res)
            partial = True
            chargers = self.data.chargers
            section_health["chargers"] = f"error:{type(ch_res).__name__}"
            self.observability.capture_error(
                source=__name__,
                stage="coordinator.load_chargers",
                severity="warning",
                kind="transport",
                message=str(ch_res),
                correlation_id=correlation_id,
            )
        else:
            chargers = ch_res
            section_health["chargers"] = f"ok:{len(chargers)}"
            self.observability.mark_data_received("chargers", len(chargers))
            self.observability.mark_data_processed("chargers", len(chargers))

        if isinstance(t_res, Exception):
            last_err = last_err or str(t_res)
            partial = True
            tariffs = self.data.tariffs
            section_health["tariffs"] = "failed"
            self.observability.capture_error(
                source=__name__,
                stage="coordinator.load_tariffs",
                severity="warning",
                kind="transport",
                message=str(t_res),
                correlation_id=correlation_id,
            )
        else:
            tariffs_list, tariffs_ok = t_res
            tariffs = tariffs_list
            inst_features = replace(inst_features, tariffs_available=tariffs_ok)
            if tariffs_ok:
                section_health["tariffs"] = "ok"
            else:
                partial = True
                section_health["tariffs"] = "partial"
            self.observability.mark_data_received("tariffs", len(tariffs))
            self.observability.mark_data_processed("tariffs", len(tariffs))
            if not tariffs:
                self.observability.mark_empty_dataset("tariffs")

        if isinstance(a_res, Exception):
            last_err = last_err or str(a_res)
            partial = True
            alerts_list = self.data.alerts
            section_health["alerts"] = "failed"
            self.observability.capture_error(
                source=__name__,
                stage="coordinator.load_alerts",
                severity="warning",
                kind="transport",
                message=str(a_res),
                correlation_id=correlation_id,
            )
        else:
            alerts_items, alerts_ok = a_res
            alerts_list = alerts_items
            inst_features = replace(inst_features, alerts_available=alerts_ok)
            if alerts_ok:
                section_health["alerts"] = "ok"
            else:
                partial = True
                section_health["alerts"] = "partial"
            self.observability.mark_data_received("alerts", len(alerts_list))
            self.observability.mark_data_processed("alerts", len(alerts_list))

        if consumption and consumption.phase_metrics:
            inst_features = replace(
                inst_features,
                has_three_phase=phase_metrics_has_three_phase(consumption.phase_metrics),
            )

        charger_features = merge_charger_features(charger_features_prev, chargers)

        now_ms = int(time.time() * 1000)
        entry = self.config_entry
        opt = entry.options
        data = entry.data
        hist_days = int(
            opt.get(CONF_SESSION_HISTORY_DAYS)
            or data.get(CONF_SESSION_HISTORY_DAYS)
            or DEFAULT_SESSION_HISTORY_DAYS
        )
        hist_days = max(1, min(hist_days, 90))
        max_sess_ch = int(
            opt.get(CONF_MAX_SESSION_CHARGERS)
            or data.get(CONF_MAX_SESSION_CHARGERS)
            or MAX_SESSION_POLL_CHARGERS
        )
        max_sess_ch = max(1, min(max_sess_ch, 20))
        park_raw = opt.get(CONF_CHARGING_PARK_ID_OVERRIDE) or data.get(
            CONF_CHARGING_PARK_ID_OVERRIDE
        )
        charging_park_id: int | None = None
        if park_raw is not None and str(park_raw).strip() != "":
            try:
                charging_park_id = int(park_raw)
            except (TypeError, ValueError):
                charging_park_id = None
        from_ms = now_ms - hist_days * 86400 * 1000
        sessions_active: list[ChargingSession] = list(self.data.sessions_active)
        sessions_recent: list[ChargingSession] = list(self.data.sessions_recent)
        seen_ids: set[str] = set()

        async def sessions_for(ch: EVCharger) -> list[ChargingSession]:
            return await self._api.list_charging_sessions(
                ch.serial,
                from_ms,
                now_ms,
                service_location_id=self._service_location_id,
                charging_park_id=charging_park_id,
            )

        to_poll = chargers[:max_sess_ch]
        if to_poll:
            session_results_ok = 0
            merged_active: list[ChargingSession] = []
            merged_recent: list[ChargingSession] = []
            sess_out = await asyncio.gather(
                *[sessions_for(ch) for ch in to_poll],
                return_exceptions=True,
            )
            for result in sess_out:
                if isinstance(result, SmappeeAuthError):
                    self.observability.capture_error(
                        source=__name__,
                        stage="coordinator.load_sessions",
                        severity="error",
                        kind="auth",
                        message=str(result),
                        correlation_id=correlation_id,
                    )
                    self.config_entry.async_start_reauth(self.hass)
                    raise ConfigEntryAuthFailed(str(result)) from result
                if isinstance(result, Exception):
                    partial = True
                    section_health["sessions"] = "partial"
                    last_err = last_err or str(result)
                    self.observability.capture_error(
                        source=__name__,
                        stage="coordinator.load_sessions",
                        severity="warning",
                        kind="transport",
                        message=str(result),
                        correlation_id=correlation_id,
                    )
                    continue
                session_results_ok += 1
                self.observability.mark_data_received("sessions", len(result))
                self.observability.mark_data_processed("sessions", len(result))
                if not result:
                    self.observability.mark_empty_dataset("sessions")
                for s in result:
                    if s.id in seen_ids:
                        continue
                    seen_ids.add(s.id)
                    st = s.status.upper()
                    if st in ("CHARGING", "STARTED"):
                        merged_active.append(s)
                    else:
                        merged_recent.append(s)
            if session_results_ok > 0:
                sessions_active = merged_active
                sessions_recent = merged_recent
            else:
                partial = True
                section_health["sessions"] = "failed"
        if "sessions" not in section_health:
            section_health["sessions"] = "ok"

        sessions_recent.sort(
            key=lambda s: s.start or datetime.min.replace(tzinfo=UTC),
            reverse=True,
        )
        sessions_recent = sessions_recent[:50]

        if bool(opt.get(CONF_DEBUG_SESSION_JSON_KEYS)) and _LOGGER.isEnabledFor(
            logging.DEBUG
        ):
            key_union: set[str] = set()
            for s in sessions_active + sessions_recent:
                key_union.update(str(k) for k in s.raw)
            log_event(
                _LOGGER,
                source=__name__,
                stage="coordinator.session_keys",
                severity="debug",
                message="session key union",
                correlation_id=correlation_id,
                context={"keys": sorted(key_union)},
            )

        reim = self._load_reimbursement_from_options()
        monthly = self._compute_reimbursement_monthly(
            reim, sessions_recent + sessions_active
        )
        mock_mode = str(os.getenv(ENV_MOCK_DATA, "")).strip().lower() in (
            "1",
            "true",
            "yes",
            "on",
        )
        if mock_mode:
            now_utc = datetime.now(UTC)
            installation = build_mock_installation(self._service_location_id)
            consumption = build_mock_consumption(now_utc)
            chargers = build_mock_chargers(now_utc)
            sessions_active, sessions_recent = build_mock_sessions(now_utc)
            tariffs = build_mock_tariffs()
            reim = build_mock_reimbursement()
            monthly = self._compute_reimbursement_monthly(
                reim, sessions_recent + sessions_active
            )
            partial = False
            section_health = {
                "consumption": "ok",
                "chargers": "ok",
                "tariffs": "ok",
                "alerts": "ok",
                "sessions": "ok",
            }
            validation_warnings.append("mock_data_mode_enabled")

        device_rows = (
            iter_device_dicts(installation.raw)
            if installation and isinstance(installation.raw, dict)
            else []
        )
        discovery_snapshot = merge_discovery(
            installation,
            chargers,
            device_rows=device_rows,
            detail_fetch_used=self._discovery_ever_fetched_detail,
        )
        now_ts = datetime.now(UTC)
        last_observed = dict(self.data.discovery_last_observed)
        for node in discovery_snapshot.nodes:
            last_observed[node.node_id] = now_ts
            node_key = node.serial or node.node_id
            self.observability.mark_device_seen(node_key)
            self.observability.set_connection_status(
                f"device:{node_key}",
                "connected"
                if (node.availability is not False and node.api_online is not False)
                else "disconnected",
            )

        out = SmappeeCoordinatorData(
            installation=installation,
            installation_features=inst_features,
            charger_features=charger_features,
            consumption=consumption or self.data.consumption,
            chargers=chargers,
            sessions_active=sessions_active,
            sessions_recent=sessions_recent,
            tariffs=tariffs,
            alerts=alerts_list,
            reimbursement=reim,
            reimbursement_monthly=monthly,
            last_successful_update=self.data.last_successful_update,
            last_error=last_err,
            api_partial=partial or (consumption.stale if consumption else False),
            backend_health=section_health,
            validation_warnings=validation_warnings,
            mock_mode=mock_mode,
            discovery=discovery_snapshot,
            discovery_last_observed=last_observed,
        )
        # Only advance "last good sync" when we have non-stale consumption data.
        if consumption is not None and not consumption.stale:
            out.last_successful_update = datetime.now(UTC)
        disconnected = [
            node.serial or node.node_id
            for node in discovery_snapshot.nodes
            if node.availability is False or node.api_online is False
        ]
        self.observability_alerts = self.observability.evaluate_alerts(
            no_data_timeout_s=120,
            parse_failure_threshold=3,
            disconnect_threshold_s=max(int(self.update_interval.total_seconds()) * 3, 120),
            disconnected_devices=disconnected,
        )
        self.observability.set_connection_status("api", "ok")
        elapsed_ms = (time.perf_counter() - refresh_started) * 1000.0
        self.observability.observe_ms("refresh_duration_ms", elapsed_ms, stage="full")
        log_event(
            _LOGGER,
            source=__name__,
            stage="coordinator.refresh.end",
            severity="info",
            message="refresh cycle completed",
            correlation_id=correlation_id,
            context={
                "partial": out.api_partial,
                "elapsed_ms": round(elapsed_ms, 3),
                "health": out.backend_health,
                "last_error": out.last_error,
            },
        )
        reset_correlation_id(token)
        return out

    def _load_reimbursement_from_options(self) -> ReimbursementConfig:
        opt = self.config_entry.options
        rate = float(opt.get("reimbursement_rate_per_kwh", 0) or 0)
        currency = str(opt.get("reimbursement_currency", "EUR") or "EUR")
        cap = opt.get("belgium_cap_eur_per_kwh")
        cap_f = float(cap) if cap is not None else None
        return ReimbursementConfig(
            rate_per_kwh=rate,
            currency=currency,
            belgium_cap_eur_per_kwh=cap_f,
        )

    def _compute_reimbursement_monthly(
        self,
        cfg: ReimbursementConfig,
        sessions: list[ChargingSession],
    ) -> ReimbursementSummary:
        month = datetime.now(UTC).strftime("%Y-%m")
        total_kwh = 0.0
        count = 0
        rate = cfg.rate_per_kwh
        if cfg.belgium_cap_eur_per_kwh is not None:
            rate = min(rate, cfg.belgium_cap_eur_per_kwh)
        for s in sessions:
            if s.start and s.start.strftime("%Y-%m") != month:
                continue
            if s.energy_wh:
                total_kwh += s.energy_wh / 1000.0
                count += 1
        pending = total_kwh * rate
        return ReimbursementSummary(
            month=month,
            total_kwh=round(total_kwh, 3),
            reimbursed_amount=0.0,
            pending_amount=round(pending, 2),
            sessions_count=count,
        )

    def panel_data_dict(self) -> dict[str, Any]:
        """Serialize for WebSocket panel."""
        return build_panel_data_dict(self.data)

    async def async_set_connector_mode(
        self,
        station_serial: str,
        connector_position: int,
        mode: str,
        *,
        limit_percent: int | None = None,
        current_a: float | None = None,
    ) -> None:
        """Write charging mode / limit via domain API (single write path)."""
        try:
            await self._api.set_connector_charging_mode(
                station_serial,
                connector_position,
                mode,
                limit_percent=limit_percent,
                current_a=current_a,
            )
        except SmappeeAuthError:
            self.config_entry.async_start_reauth(self.hass)
            raise

    async def async_set_led_brightness(
        self, station_serial: str, brightness_pct: int
    ) -> None:
        """Set charger LED brightness (raises SmappeeApiError on failure)."""
        try:
            await self._api.set_station_led_brightness(station_serial, brightness_pct)
        except SmappeeAuthError:
            self.config_entry.async_start_reauth(self.hass)
            raise

    async def async_set_charger_availability(
        self, station_serial: str, available: bool
    ) -> bool:
        """PATCH availability; returns False if API rejects; updates feature flags."""
        try:
            ok = await self._api.set_station_availability(station_serial, available)
        except SmappeeAuthError:
            self.config_entry.async_start_reauth(self.hass)
            raise
        if not ok:
            self.mark_charger_availability_api_unsupported(station_serial)
        return ok
