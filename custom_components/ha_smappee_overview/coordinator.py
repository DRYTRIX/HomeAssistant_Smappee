"""Data update coordinator for Smappee Overview."""

from __future__ import annotations

import asyncio
import logging
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
        data = self.data
        if "consumption" in patch and isinstance(patch["consumption"], dict):
            c = parse_consumption_summary(patch["consumption"], stale=False)
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
            )
        self.async_set_updated_data(data)
        for cb in list(self._push_listeners):
            try:
                cb(data)
            except Exception:  # noqa: BLE001
                _LOGGER.exception("push listener failed")

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

    async def _async_update_data(self) -> SmappeeCoordinatorData:
        partial = False
        last_err: str | None = None
        installation = self.data.installation

        if installation is None:
            try:
                locations = await self._api.list_service_locations()
            except SmappeeAuthError as err:
                raise ConfigEntryAuthFailed(str(err)) from err
            except (SmappeeApiError, OSError, TimeoutError) as err:
                installation = Installation(
                    id=self._service_location_id,
                    name=self.config_entry.data.get(CONF_SERVICE_LOCATION_NAME, "Smappee"),
                )
                partial = True
                last_err = str(err)
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

        if isinstance(c_res, SmappeeAuthError):
            self.config_entry.async_start_reauth(self.hass)
            raise ConfigEntryAuthFailed(str(c_res)) from c_res
        if isinstance(c_res, Exception):
            last_err = str(c_res)
            partial = True
            consumption = self.data.consumption
        else:
            consumption = c_res

        if isinstance(ch_res, SmappeeAuthError):
            raise ConfigEntryAuthFailed(str(ch_res)) from ch_res
        if isinstance(ch_res, Exception):
            last_err = last_err or str(ch_res)
            partial = True
            chargers = self.data.chargers
        else:
            chargers = ch_res

        if isinstance(t_res, Exception):
            tariffs = self.data.tariffs
        else:
            tariffs_list, tariffs_ok = t_res
            tariffs = tariffs_list
            inst_features = replace(inst_features, tariffs_available=tariffs_ok)

        if isinstance(a_res, Exception):
            alerts_list = self.data.alerts
        else:
            alerts_items, alerts_ok = a_res
            alerts_list = alerts_items
            inst_features = replace(inst_features, alerts_available=alerts_ok)

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
        sessions_active: list[ChargingSession] = []
        sessions_recent: list[ChargingSession] = []
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
            sess_out = await asyncio.gather(
                *[sessions_for(ch) for ch in to_poll],
                return_exceptions=True,
            )
            for result in sess_out:
                if isinstance(result, Exception):
                    partial = True
                    continue
                for s in result:
                    if s.id in seen_ids:
                        continue
                    seen_ids.add(s.id)
                    st = s.status.upper()
                    if st in ("CHARGING", "STARTED"):
                        sessions_active.append(s)
                    else:
                        sessions_recent.append(s)

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
            _LOGGER.debug("Smappee session JSON keys (union): %s", sorted(key_union))

        reim = self._load_reimbursement_from_options()
        monthly = self._compute_reimbursement_monthly(
            reim, sessions_recent + sessions_active
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
        )
        if consumption and not consumption.stale:
            out.last_successful_update = datetime.now(UTC)
        elif not partial and consumption:
            out.last_successful_update = datetime.now(UTC)
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
