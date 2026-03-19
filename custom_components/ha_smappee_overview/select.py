"""Charging mode select per connector."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity, SelectEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CHARGING_MODE_NORMAL,
    CHARGING_MODE_PAUSED,
    CHARGING_MODE_SMART,
    DOMAIN,
    MODE_SMART,
    MODE_SOLAR,
    MODE_STANDARD,
)
from .coordinator import SmappeeOverviewCoordinator
from .entity import charger_device_info


def _mode_to_option(mode: str) -> str:
    m = mode.upper()
    if m == CHARGING_MODE_SMART:
        return MODE_SMART
    if m == CHARGING_MODE_PAUSED:
        return "paused"
    return MODE_STANDARD


def _option_to_mode(option: str) -> str:
    o = option.lower()
    if o == MODE_SMART or o == MODE_SOLAR:
        return CHARGING_MODE_SMART
    if o == "paused":
        return CHARGING_MODE_PAUSED
    return CHARGING_MODE_NORMAL


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmappeeOverviewCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        "coordinator"
    ]
    added: set[tuple[str, int]] = set()

    def _discover(_: object | None = None) -> None:
        todo: list[tuple[str, int]] = []
        for ch in coordinator.data.chargers:
            feat = coordinator.data.charger_features.get(ch.serial)
            positions = [c.position for c in ch.connectors] or [1]
            for pos in positions:
                key = (ch.serial, pos)
                if key not in added:
                    todo.append(key)
        if not todo:
            return
        entities = [
            SmappeeConnectorModeSelect(coordinator, serial, pos)
            for serial, pos in todo
        ]
        async_add_entities(entities)
        added.update(todo)

    _discover()
    config_entry.async_on_unload(coordinator.async_add_listener(_discover))


class SmappeeConnectorModeSelect(CoordinatorEntity, SelectEntity):
    """Select STANDARD / SMART / SOLAR / PAUSED."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: SmappeeOverviewCoordinator,
        charger_serial: str,
        connector_position: int,
    ) -> None:
        super().__init__(coordinator)
        self._charger_serial = charger_serial
        self._connector_position = connector_position
        entry = coordinator.config_entry
        self._attr_unique_id = (
            f"{entry.unique_id}_{charger_serial}_conn{connector_position}_mode"
        )
        self._attr_device_info = charger_device_info(coordinator, charger_serial)
        self.entity_description = SelectEntityDescription(
            key=f"mode_{charger_serial}_{connector_position}",
            translation_key="connector_charging_mode",
        )

    @property
    def options(self) -> list[str]:
        feat = self.coordinator.data.charger_features.get(self._charger_serial)
        if feat and not feat.supports_smart_mode:
            return [MODE_STANDARD, "paused"]
        return [MODE_STANDARD, MODE_SMART, MODE_SOLAR, "paused"]

    @property
    def current_option(self) -> str | None:
        ch = next(
            (c for c in self.coordinator.data.chargers if c.serial == self._charger_serial),
            None,
        )
        if not ch:
            return None
        conn = next(
            (c for c in ch.connectors if c.position == self._connector_position),
            ch.connectors[0] if ch.connectors else None,
        )
        if not conn:
            return MODE_STANDARD
        return _mode_to_option(conn.mode)

    async def async_select_option(self, option: str) -> None:
        client = self.hass.data[DOMAIN][self.coordinator.config_entry.entry_id]["client"]
        await client.set_connector_mode(
            self._charger_serial,
            self._connector_position,
            _option_to_mode(option),
        )
        await self.coordinator.async_request_refresh()
