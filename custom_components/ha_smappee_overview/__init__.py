"""Smappee Overview custom integration.

Keep this module lightweight: ``pytest`` imports subpackages (``models``,
``api.endpoints``, …) without pulling Home Assistant or aiohttp. Runtime setup
lives in :mod:`ha_smappee_overview.integration`.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

__all__ = ["DOMAIN", "async_setup_entry", "async_unload_entry"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from config entry."""
    from . import integration

    return await integration.async_setup_entry(hass, entry)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""
    from . import integration

    return await integration.async_unload_entry(hass, entry)
