"""EV charger service handlers."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError

from ..api.client import SmappeeAPIClient, SmappeeApiError
from ..coordinator import SmappeeOverviewCoordinator
from ..const import (
    CHARGING_MODE_NORMAL,
    CHARGING_MODE_PAUSED,
    CHARGING_MODE_SMART,
    DOMAIN,
    MODE_SMART,
    MODE_SOLAR,
    MODE_STANDARD,
)

_LOGGER = logging.getLogger(__name__)


def _get_client(hass: HomeAssistant, config_entry_id: str) -> SmappeeAPIClient:
    entry_data = hass.data.get(DOMAIN, {}).get(config_entry_id)
    if not entry_data:
        raise HomeAssistantError(f"Unknown config entry: {config_entry_id}")
    client = entry_data.get("client")
    if not client:
        raise HomeAssistantError("API client not available")
    return client


async def async_start_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Start charging (NORMAL mode)."""
    client = _get_client(hass, call.data["config_entry_id"])
    current = call.data.get("current_a")
    await client.set_connector_mode(
        call.data["charger_serial"],
        int(call.data["connector_position"]),
        CHARGING_MODE_NORMAL,
        current_a=float(current) if current is not None else None,
    )


async def async_pause_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Pause charging."""
    client = _get_client(hass, call.data["config_entry_id"])
    await client.set_connector_mode(
        call.data["charger_serial"],
        int(call.data["connector_position"]),
        CHARGING_MODE_PAUSED,
    )


async def async_stop_charging(hass: HomeAssistant, call: ServiceCall) -> None:
    """Stop / pause session (API uses PAUSED)."""
    await async_pause_charging(hass, call)


async def async_set_charging_mode(hass: HomeAssistant, call: ServiceCall) -> None:
    """Set NORMAL, SMART, or SOLAR (mapped to SMART)."""
    client = _get_client(hass, call.data["config_entry_id"])
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
        await client.set_connector_mode(
            call.data["charger_serial"],
            int(call.data["connector_position"]),
            api_mode,
        )
    except SmappeeApiError as err:
        raise HomeAssistantError(str(err)) from err


async def async_set_charging_current(hass: HomeAssistant, call: ServiceCall) -> None:
    """Set charge current in NORMAL mode."""
    client = _get_client(hass, call.data["config_entry_id"])
    await client.set_connector_mode(
        call.data["charger_serial"],
        int(call.data["connector_position"]),
        CHARGING_MODE_NORMAL,
        current_a=float(call.data["current_a"]),
    )


async def async_set_led_brightness(hass: HomeAssistant, call: ServiceCall) -> None:
    """LED brightness 0–100."""
    client = _get_client(hass, call.data["config_entry_id"])
    try:
        await client.set_led_brightness(
            call.data["charger_serial"],
            int(call.data["brightness_pct"]),
        )
    except SmappeeApiError as err:
        _LOGGER.debug("LED brightness not supported: %s", err)


async def async_refresh_panel_data(hass: HomeAssistant, call: ServiceCall) -> None:
    """Force coordinator refresh for a config entry."""
    entry_data = hass.data.get(DOMAIN, {}).get(call.data["config_entry_id"])
    if not entry_data:
        raise HomeAssistantError("Unknown config entry")
    coordinator = entry_data.get("coordinator")
    if coordinator:
        await coordinator.async_request_refresh()


async def async_set_charger_availability(hass: HomeAssistant, call: ServiceCall) -> None:
    """PATCH charger available flag."""
    eid = call.data["config_entry_id"]
    client = _get_client(hass, eid)
    serial = call.data["charger_serial"]
    available = bool(call.data["available"])
    ok = await client.set_charger_availability(serial, available)
    entry_data = hass.data.get(DOMAIN, {}).get(eid)
    coord: SmappeeOverviewCoordinator | None = (
        entry_data.get("coordinator") if entry_data else None
    )
    if coord and not ok:
        coord.mark_charger_availability_api_unsupported(serial)
    if coord:
        await coord.async_request_refresh()
