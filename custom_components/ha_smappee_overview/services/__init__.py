"""Register integration services."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from . import ev_charger

CHARGER_SCHEMA = vol.Schema(
    {
        vol.Required("config_entry_id"): cv.string,
        vol.Required("charger_serial"): cv.string,
        vol.Optional("connector_position", default=1): vol.Coerce(int),
    }
)

LED_SCHEMA = vol.Schema(
    {
        vol.Required("config_entry_id"): cv.string,
        vol.Required("charger_serial"): cv.string,
        vol.Required("brightness_pct"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
    }
)

CURRENT_SCHEMA = CHARGER_SCHEMA.extend(
    {
        vol.Required("current_a"): vol.Coerce(float),
    }
)

MODE_SCHEMA = CHARGER_SCHEMA.extend(
    {
        vol.Required("mode"): cv.string,
    }
)

START_SCHEMA = CHARGER_SCHEMA.extend(
    {
        vol.Optional("current_a"): vol.Coerce(float),
    }
)

REFRESH_SCHEMA = vol.Schema(
    {
        vol.Required("config_entry_id"): cv.string,
    }
)

AVAILABILITY_SCHEMA = vol.Schema(
    {
        vol.Required("config_entry_id"): cv.string,
        vol.Required("charger_serial"): cv.string,
        vol.Required("available"): cv.boolean,
    }
)


def async_register_services(hass: HomeAssistant) -> None:
    """Register all services once."""
    if hass.data.get(f"{DOMAIN}_services_registered"):
        return
    hass.data[f"{DOMAIN}_services_registered"] = True

    async def start(call: ServiceCall) -> None:
        await ev_charger.async_start_charging(hass, call)

    async def pause(call: ServiceCall) -> None:
        await ev_charger.async_pause_charging(hass, call)

    async def stop(call: ServiceCall) -> None:
        await ev_charger.async_stop_charging(hass, call)

    async def set_mode(call: ServiceCall) -> None:
        await ev_charger.async_set_charging_mode(hass, call)

    async def set_current(call: ServiceCall) -> None:
        await ev_charger.async_set_charging_current(hass, call)

    async def set_led(call: ServiceCall) -> None:
        await ev_charger.async_set_led_brightness(hass, call)

    async def refresh(call: ServiceCall) -> None:
        await ev_charger.async_refresh_panel_data(hass, call)

    async def refresh_now(call: ServiceCall) -> None:
        await ev_charger.async_refresh_panel_data(hass, call)

    async def set_availability(call: ServiceCall) -> None:
        await ev_charger.async_set_charger_availability(hass, call)

    hass.services.async_register(DOMAIN, "start_charging", start, schema=START_SCHEMA)
    hass.services.async_register(DOMAIN, "pause_charging", pause, schema=CHARGER_SCHEMA)
    hass.services.async_register(DOMAIN, "stop_charging", stop, schema=CHARGER_SCHEMA)
    hass.services.async_register(DOMAIN, "set_charging_mode", set_mode, schema=MODE_SCHEMA)
    hass.services.async_register(DOMAIN, "set_charging_current", set_current, schema=CURRENT_SCHEMA)
    hass.services.async_register(DOMAIN, "set_led_brightness", set_led, schema=LED_SCHEMA)
    hass.services.async_register(DOMAIN, "refresh", refresh, schema=REFRESH_SCHEMA)
    hass.services.async_register(DOMAIN, "refresh_now", refresh_now, schema=REFRESH_SCHEMA)
    hass.services.async_register(
        DOMAIN, "set_charger_availability", set_availability, schema=AVAILABILITY_SCHEMA
    )


def async_unregister_services(hass: HomeAssistant) -> None:
    """Remove services when last entry unloaded."""
    if not hass.data.get(f"{DOMAIN}_services_registered"):
        return
    for name in (
        "start_charging",
        "pause_charging",
        "stop_charging",
        "set_charging_mode",
        "set_charging_current",
        "set_led_brightness",
        "refresh",
        "refresh_now",
        "set_charger_availability",
    ):
        hass.services.async_remove(DOMAIN, name)
    hass.data[f"{DOMAIN}_services_registered"] = False
