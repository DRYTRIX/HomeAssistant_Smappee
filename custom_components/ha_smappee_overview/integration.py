"""Home Assistant entry points and wiring (heavy imports — not loaded by unit tests)."""

from __future__ import annotations

import logging
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import aiohttp_client
from homeassistant.helpers import config_validation as cv
from homeassistant.components import websocket_api

from .api.client import SmappeeAPIClient, SmappeeApiError
from .const import (
    CONF_ACCESS_TOKEN,
    CONF_CLIENT_ID,
    CONF_CLIENT_SECRET,
    CONF_COUNTRY_CODE,
    CONF_EI_ENABLE_CAPACITY_TRACKING,
    CONF_REFRESH_TOKEN,
    CONF_SERVICE_LOCATION_ID,
    CONF_TOKEN_EXPIRES_AT,
    DATA_CLIENT,
    DATA_COORDINATOR,
    DOMAIN,
    PANEL_CACHE_TTL_S,
    STATIC_URL_PATH,
    WS_TYPE_LIST_ENTRIES,
    WS_TYPE_HEALTH_CHECK,
    WS_TYPE_PANEL_DATA,
)
from .coordinator import SmappeeOverviewCoordinator
from .debug_view import SmappeeDebugDataView
from .panel_entity_map import build_entity_map
from .panel_payload import build_full_panel_payload
from .recorder_peak import async_sample_monthly_max_grid_import_kw
from .services import async_register_services, async_unregister_services
from .observability import (
    log_event,
    new_correlation_id,
    reset_correlation_id,
    set_correlation_id,
)

_LOGGER = logging.getLogger(__name__)


def _payload_has_substantive_data(payload: dict[str, Any]) -> bool:
    """Detect payloads that contain meaningful live data."""
    if (payload.get("chargers") or []):
        return True
    if (payload.get("sessions_active") or []) or (payload.get("sessions_recent") or []):
        return True
    cons = payload.get("consumption")
    if isinstance(cons, dict) and any(
        cons.get(k) is not None
        for k in ("grid_import_w", "grid_export_w", "solar_w", "consumption_w")
    ):
        return True
    return False


def _attach_freshness(
    payload: dict[str, Any], *, generated_at_ts: float, from_cache: bool
) -> dict[str, Any]:
    out = dict(payload)
    age = max(0.0, time.time() - generated_at_ts)
    out["generated_at_utc"] = datetime.fromtimestamp(generated_at_ts, tz=UTC).isoformat()
    out["cache_age_s"] = round(age, 3)
    out["from_cache"] = from_cache
    return out


# WebSocket commands and static files use global hass.data flags so they register once
# while multiple config entries stay loaded (see _register_websocket, static path).

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.SWITCH,
    Platform.SELECT,
    Platform.NUMBER,
    Platform.BUTTON,
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from config entry."""
    hass.data.setdefault(DOMAIN, {})

    session = aiohttp_client.async_get_clientsession(hass)

    async def on_token_update(tokens: dict[str, Any]) -> None:
        hass.config_entries.async_update_entry(
            entry,
            data={**entry.data, **tokens},
        )

    client = SmappeeAPIClient(
        session,
        entry.data[CONF_CLIENT_ID],
        entry.data[CONF_CLIENT_SECRET],
        entry.data[CONF_ACCESS_TOKEN],
        entry.data.get(CONF_REFRESH_TOKEN, ""),
        float(entry.data[CONF_TOKEN_EXPIRES_AT]),
        on_token_update=on_token_update,
    )

    coordinator = SmappeeOverviewCoordinator(hass, entry, client)
    client._observability = coordinator.observability  # noqa: SLF001
    panel_cache_key_prefix = f"{entry.entry_id}:"

    def _invalidate_panel_cache() -> None:
        cache_root = hass.data.get(f"{DOMAIN}_panel_cache")
        if not isinstance(cache_root, dict):
            return
        for key in list(cache_root.keys()):
            if str(key).startswith(panel_cache_key_prefix):
                cache_root.pop(key, None)

    try:
        await coordinator.async_config_entry_first_refresh()
    except ConfigEntryAuthFailed:
        raise
    except (aiohttp.ClientError, TimeoutError, SmappeeApiError) as err:
        raise ConfigEntryNotReady(f"Cannot reach Smappee API: {err}") from err

    hass.data[DOMAIN][entry.entry_id] = {
        DATA_CLIENT: client,
        DATA_COORDINATOR: coordinator,
    }
    coordinator.async_add_listener(_invalidate_panel_cache)

    static_dir = Path(__file__).parent / "static"
    if static_dir.is_dir() and not hass.data.get(f"{DOMAIN}_static_registered"):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    STATIC_URL_PATH,
                    str(static_dir),
                    cache_headers=False,
                ),
            ]
        )
        hass.data[f"{DOMAIN}_static_registered"] = True
    elif not static_dir.is_dir():
        _LOGGER.warning(
            "%s: panel static dir missing — run `npm run build` in frontend/ and copy dist to static/",
            DOMAIN,
        )

    panel_path = f"{DOMAIN}_{entry.entry_id[:8]}"
    module_url = f"{STATIC_URL_PATH}/panel.js"
    try:
        await async_register_panel(
            hass,
            frontend_url_path=panel_path,
            webcomponent_name="ha-smappee-overview-panel",
            sidebar_title=entry.title,
            sidebar_icon="mdi:solar-power-variant",
            module_url=module_url,
            config={
                "config_entry_id": entry.entry_id,
                "title": entry.title,
            },
            require_admin=False,
        )
    except ValueError:
        _LOGGER.debug("Panel %s may already be registered", panel_path)

    hass.data[DOMAIN][entry.entry_id]["panel_path"] = panel_path

    _register_websocket(hass)
    if not hass.data.get(f"{DOMAIN}_debug_view_registered"):
        hass.http.register_view(SmappeeDebugDataView())
        hass.data[f"{DOMAIN}_debug_view_registered"] = True
    async_register_services(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload on options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unload_ok:
        return False

    from homeassistant.components.frontend import async_remove_panel

    panel_path = hass.data[DOMAIN].get(entry.entry_id, {}).get("panel_path")
    if panel_path:
        async_remove_panel(hass, panel_path, warn_if_unknown=False)
    cache_root = hass.data.get(f"{DOMAIN}_panel_cache")
    if isinstance(cache_root, dict):
        for key in list(cache_root.keys()):
            if str(key).startswith(f"{entry.entry_id}:"):
                cache_root.pop(key, None)

    hass.data[DOMAIN].pop(entry.entry_id, None)
    if not hass.data[DOMAIN]:
        async_unregister_services(hass)
        hass.data.pop(DOMAIN)
        hass.data.pop(f"{DOMAIN}_static_registered", None)

    return True


@callback
def _register_websocket(hass: HomeAssistant) -> None:
    if hass.data.get(f"{DOMAIN}_ws_registered"):
        return

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_TYPE_PANEL_DATA,
            vol.Required("config_entry_id"): cv.string,
            vol.Optional("include_advanced"): cv.boolean,
        }
    )
    @websocket_api.async_response
    async def handle_panel_data(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        correlation_id = new_correlation_id()
        token = set_correlation_id(correlation_id)
        entry_id = msg["config_entry_id"]
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN:
            log_event(
                _LOGGER,
                source=__name__,
                stage="ws.get_panel_data",
                severity="warning",
                message="unknown config entry",
                correlation_id=correlation_id,
                context={"entry_id": entry_id},
            )
            connection.send_error(
                msg["id"],
                websocket_api.ERR_NOT_FOUND,
                "Unknown config entry",
            )
            reset_correlation_id(token)
            return
        domain_entry = hass.data.get(DOMAIN, {}).get(entry_id)
        if not domain_entry:
            log_event(
                _LOGGER,
                source=__name__,
                stage="ws.get_panel_data",
                severity="warning",
                message="entry not loaded",
                correlation_id=correlation_id,
                context={"entry_id": entry_id},
            )
            connection.send_error(
                msg["id"],
                websocket_api.ERR_NOT_FOUND,
                "Entry not loaded",
            )
            reset_correlation_id(token)
            return
        coord: SmappeeOverviewCoordinator = domain_entry[DATA_COORDINATOR]
        entry = coord.config_entry
        opt = entry.options
        country = str(opt.get(CONF_COUNTRY_CODE) or "").strip().upper()
        peak_sample: dict[str, Any] | None = None
        if country == "BE" and opt.get(CONF_EI_ENABLE_CAPACITY_TRACKING):
            em = build_entity_map(hass, entry)
            gid = em.get("grid_import")
            if gid:
                peak_sample = await async_sample_monthly_max_grid_import_kw(hass, gid)
            else:
                peak_sample = {
                    "peak_kw_sampled": None,
                    "sample_count": 0,
                    "method": "monthly_max_of_ha_states",
                    "unavailable_reason": "grid_import_entity_missing",
                }
        try:
            include_advanced = bool(msg.get("include_advanced") or msg.get("include_debug"))
            cache_key = f"{entry_id}:{int(include_advanced)}"
            cache_root = hass.data.setdefault(f"{DOMAIN}_panel_cache", {})
            cache_item = cache_root.get(cache_key)
            now_ts = time.time()
            if cache_item and (now_ts - float(cache_item["generated_at"]) <= PANEL_CACHE_TTL_S):
                payload = _attach_freshness(
                    cache_item["payload"],
                    generated_at_ts=float(cache_item["generated_at"]),
                    from_cache=True,
                )
                connection.send_result(msg["id"], payload)
                return

            fresh_payload = build_full_panel_payload(
                hass,
                coord,
                intelligence_peak_sample=peak_sample,
                include_advanced_requested=include_advanced,
            )
            if (
                cache_item
                and not _payload_has_substantive_data(fresh_payload)
                and _payload_has_substantive_data(cache_item["payload"])
                and (now_ts - float(cache_item["generated_at"]) <= PANEL_CACHE_TTL_S)
            ):
                payload = _attach_freshness(
                    cache_item["payload"],
                    generated_at_ts=float(cache_item["generated_at"]),
                    from_cache=True,
                )
                connection.send_result(msg["id"], payload)
                return

            cache_root[cache_key] = {"generated_at": now_ts, "payload": fresh_payload}
            payload = _attach_freshness(
                fresh_payload, generated_at_ts=now_ts, from_cache=False
            )
            connection.send_result(msg["id"], payload)
            log_event(
                _LOGGER,
                source=__name__,
                stage="ws.get_panel_data",
                severity="info",
                message="panel data served",
                correlation_id=correlation_id,
                context={
                    "entry_id": entry_id,
                    "api_partial": payload.get("api_partial"),
                    "chargers": len(payload.get("chargers") or []),
                },
            )
        except Exception as err:  # noqa: BLE001
            coord.observability.capture_error(
                source=__name__,
                stage="ws.get_panel_data",
                severity="error",
                kind="ui_ws",
                message=str(err),
                correlation_id=correlation_id,
                context={"entry_id": entry_id},
            )
            connection.send_error(
                msg["id"],
                websocket_api.ERR_UNKNOWN_ERROR,
                f"Panel payload failed: {err}",
            )
        finally:
            reset_correlation_id(token)

    @websocket_api.websocket_command({vol.Required("type"): WS_TYPE_LIST_ENTRIES})
    @websocket_api.async_response
    async def handle_list_entries(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        entries_out: list[dict[str, Any]] = []
        for eid, _ in (hass.data.get(DOMAIN) or {}).items():
            ent = hass.config_entries.async_get_entry(eid)
            if ent is None or ent.domain != DOMAIN:
                continue
            entries_out.append(
                {
                    "entry_id": ent.entry_id,
                    "title": ent.title,
                    "service_location_id": ent.data.get(CONF_SERVICE_LOCATION_ID),
                }
            )
        connection.send_result(msg["id"], {"entries": entries_out})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_TYPE_HEALTH_CHECK,
            vol.Required("config_entry_id"): cv.string,
        }
    )
    @websocket_api.async_response
    async def handle_health_check(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        entry_id = msg["config_entry_id"]
        domain_entry = hass.data.get(DOMAIN, {}).get(entry_id)
        if not domain_entry:
            connection.send_error(
                msg["id"],
                websocket_api.ERR_NOT_FOUND,
                "Entry not loaded",
            )
            return
        coord: SmappeeOverviewCoordinator = domain_entry[DATA_COORDINATOR]
        data = coord.data
        connection.send_result(
            msg["id"],
            {
                "status": "ok" if coord.last_update_success else "degraded",
                "entry_id": entry_id,
                "last_successful_update": data.last_successful_update.isoformat()
                if data.last_successful_update
                else None,
                "api_partial": data.api_partial,
                "last_error": data.last_error,
                "backend_health": dict(data.backend_health),
                "validation_warnings": list(data.validation_warnings),
            },
        )

    websocket_api.async_register_command(hass, handle_list_entries)
    websocket_api.async_register_command(hass, handle_panel_data)
    websocket_api.async_register_command(hass, handle_health_check)
    hass.data[f"{DOMAIN}_ws_registered"] = True
