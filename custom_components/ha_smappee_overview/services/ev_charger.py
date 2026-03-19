"""EV charger service handlers."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError

from ..api.auth import SmappeeAuthError
from ..api.client import SmappeeApiError
from ..coordinator import SmappeeOverviewCoordinator
from ..const import (
    CHARGING_MODE_NORMAL,
    CHARGING_MODE_PAUSED,
    CHARGING_MODE_SMART,
    DATA_COORDINATOR,
    DOMAIN,
    MODE_SMART,
    MODE_SOLAR,
    MODE_STANDARD,
)

_LOGGER = logging.getLogger(__name__)


def _get_coordinator(hass: HomeAssistant, config_entry_id: str) -> SmappeeOverviewCoordinator:
    entry_data = hass.data.get(DOMAIN, {}).get(config_entry_id)
    if not entry_data:
        raise HomeAssistantError(f"Unknown config entry: {config_entry_id}")
    coord = entry_data.get(DATA_COORDINATOR)
    if not coord:
        raise HomeAssistantError("Integration not loaded for this config entry")
    return coord


def _raise_service_api_error(
    hass: HomeAssistant, config_entry_id: str, err: BaseException
) -> None:
    """Map transport/API errors to HomeAssistantError; trigger reauth when needed."""
    if isinstance(err, SmappeeAuthError):
        entry = hass.config_entries.async_get_entry(config_entry_id)
        if entry:
            entry.async_start_reauth(hass)
        raise HomeAssistantError(
            "Authentication with Smappee failed; please re-authenticate"
        ) from err
    if isinstance(err, SmappeeApiError):
        raise HomeAssistantError(str(err)) from err
    raise err


async def async_start_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Start charging (NORMAL mode)."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    current = call.data.get("current_a")
    try:
        await coord.async_set_connector_mode(
            call.data["charger_serial"],
            int(call.data["connector_position"]),
            CHARGING_MODE_NORMAL,
            current_a=float(current) if current is not None else None,
        )
    except (SmappeeAuthError, SmappeeApiError) as err:
        _raise_service_api_error(hass, eid, err)


async def async_pause_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Pause charging."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    try:
        await coord.async_set_connector_mode(
            call.data["charger_serial"],
            int(call.data["connector_position"]),
            CHARGING_MODE_PAUSED,
        )
    except (SmappeeAuthError, SmappeeApiError) as err:
        _map_api_errors(hass, eid)(err)


async def async_stop_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Stop / pause session (API uses PAUSED)."""
    await async_pause_charging(hass, call)


async def async_set_charging_mode(hass: HomeAssistant, call: ServiceCall) -> None:
    """Set NORMAL, SMART, or SOLAR (mapped to SMART)."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    mode = str(call.data["mode"]).lower()
    if mode == MODE_STANDARD or mode == "normal":
        api_mode = CHARGING_MODE_NORMAL
    elif mode == MODE_SMART:
        api_mode = CHARGING_MODE_SMART
    elif mode == MODE_SOLAR:
        api_mode = CHARGING_MODE_SMART
    else:
        raise HomeAssistantError(f"Invalid mode: {mode}")
    try:
        await coord.async_set_connector_mode(
            call.data["charger_serial"],
            int(call.data["connector_position"]),
            api_mode,
        )
    except (SmappeeAuthError, SmappeeApiError) as err:
        _raise_service_api_error(hass, eid, err)


async def async_set_charging_current(hass: HomeAssistant, call: ServiceCall) -> None:
    """Set charge current in NORMAL mode."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    try:
        await coord.async_set_connector_mode(
            call.data["charger_serial"],
            int(call.data["connector_position"]),
            CHARGING_MODE_NORMAL,
            current_a=float(call.data["current_a"]),
        )
    except (SmappeeAuthError, SmappeeApiError) as err:
        _raise_service_api_error(hass, eid, err)


async def async_set_led_brightness(hass: HomeAssistant, call: ServiceCall) -> None:
    """LED brightness 0–100."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    try:
        await coord.async_set_led_brightness(
            call.data["charger_serial"],
            int(call.data["brightness_pct"]),
        )
    except (SmappeeAuthError, SmappeeApiError) as err:
        _raise_service_api_error(hass, eid, err)


async def async_refresh_panel_data(hass: HomeAssistant, call: ServiceCall) -> None:
    """Force coordinator refresh for a config entry."""
    coord = _get_coordinator(hass, call.data["config_entry_id"])
    await coord.async_request_refresh()


async def async_set_charger_availability(hass: HomeAssistant, call: ServiceCall) -> None:
    """PATCH charger available flag."""
    eid = call.data["config_entry_id"]
    coord = _get_coordinator(hass, eid)
    serial = call.data["charger_serial"]
    available = bool(call.data["available"])
    try:
        ok = await coord.async_set_charger_availability(serial, available)
    except (SmappeeAuthError, SmappeeApiError) as err:
        _raise_service_api_error(hass, eid, err)
    else:
        if not ok:
            _LOGGER.warning("Charger availability API not supported for %s", serial)
        await coord.async_request_refresh()
