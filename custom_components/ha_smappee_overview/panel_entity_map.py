"""Resolve entity_ids for panel history sparklines."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

# Sensor keys from sensors.SENSOR_TYPES (service location device)
PANEL_SENSOR_KEYS: tuple[str, ...] = (
    "grid_import",
    "grid_export",
    "solar",
    "consumption",
    "battery_flow",
    "self_consumption",
)


def build_entity_map(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, str | None]:
    """Map logical keys to entity_id for this config entry."""
    registry = er.async_get(hass)
    uid_prefix = f"{entry.unique_id}_"
    out: dict[str, str | None] = {k: None for k in PANEL_SENSOR_KEYS}
    for entity in registry.entities.values():
        if entity.config_entry_id != entry.entry_id:
            continue
        if entity.platform != DOMAIN:
            continue
        uid = entity.unique_id or ""
        if not uid.startswith(uid_prefix):
            continue
        suffix = uid[len(uid_prefix) :]
        if suffix in out:
            out[suffix] = entity.entity_id
    return out
