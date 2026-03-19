"""Home Assistant entry points and wiring (heavy imports — not loaded by unit tests)."""

from __future__ import annotations

import logging
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

from .api.client import SmappeeAPIClient
from .const import (
    CONF_ACCESS_TOKEN,
    CONF_CLIENT_ID,
    CONF_CLIENT_SECRET,
    CONF_REFRESH_TOKEN,
    CONF_SERVICE_LOCATION_ID,
    CONF_TOKEN_EXPIRES_AT,
    DATA_CLIENT,
    DATA_COORDINATOR,
    DOMAIN,
    STATIC_URL_PATH,
    WS_TYPE_LIST_ENTRIES,
    WS_TYPE_PANEL_DATA,
)
from .coordinator import SmappeeOverviewCoordinator
from .panel_payload import build_full_panel_payload
from .services import async_register_services, async_unregister_services

_LOGGER = logging.getLogger(__name__)

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

    try:
        await coordinator.async_config_entry_first_refresh()
    except ConfigEntryAuthFailed:
        raise
    except (aiohttp.ClientError, TimeoutError) as err:
        raise ConfigEntryNotReady(f"Cannot reach Smappee API: {err}") from err

    hass.data[DOMAIN][entry.entry_id] = {
        DATA_CLIENT: client,
        DATA_COORDINATOR: coordinator,
    }

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
        }
    )
    @websocket_api.async_response
    async def handle_panel_data(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        entry_id = msg["config_entry_id"]
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN:
            connection.send_error(
                msg["id"],
                websocket_api.ERR_NOT_FOUND,
                "Unknown config entry",
            )
            return
        domain_entry = hass.data.get(DOMAIN, {}).get(entry_id)
        if not domain_entry:
            connection.send_error(
                msg["id"],
                websocket_api.ERR_NOT_FOUND,
                "Entry not loaded",
            )
            return
        coord: SmappeeOverviewCoordinator = domain_entry[DATA_COORDINATOR]
        connection.send_result(
            msg["id"], build_full_panel_payload(hass, coord)
        )

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

    websocket_api.async_register_command(hass, handle_list_entries)
    websocket_api.async_register_command(hass, handle_panel_data)
    hass.data[f"{DOMAIN}_ws_registered"] = True
