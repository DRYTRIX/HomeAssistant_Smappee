"""Charging current limit (A) per connector."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberEntityDescription, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfElectricCurrent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CHARGING_MODE_NORMAL, DATA_COORDINATOR, DOMAIN
from .coordinator import SmappeeOverviewCoordinator
from .entity import charger_device_info


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
            if feat and not feat.supports_current_limit:
                continue
            positions = [c.position for c in ch.connectors] or [1]
            for pos in positions:
                key = (ch.serial, pos)
                if key not in added:
                    todo.append(key)
        if not todo:
            return
        entities = [
            SmappeeConnectorCurrentNumber(coordinator, serial, pos)
            for serial, pos in todo
        ]
        async_add_entities(entities)
        added.update(todo)

    _discover()
    config_entry.async_on_unload(coordinator.async_add_listener(_discover))


class SmappeeConnectorCurrentNumber(CoordinatorEntity, NumberEntity):
    """Set charge current in NORMAL mode."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = UnitOfElectricCurrent.AMPERE
    _attr_mode = NumberMode.BOX

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
            f"{entry.unique_id}_{charger_serial}_conn{connector_position}_current"
        )
        self._attr_device_info = charger_device_info(coordinator, charger_serial)
        self.entity_description = NumberEntityDescription(
            key=f"current_{charger_serial}_{connector_position}",
            translation_key="connector_current_limit",
        )

    @property
    def native_min_value(self) -> float:
        return 6.0

    @property
    def native_max_value(self) -> float:
        feat = self.coordinator.data.charger_features.get(self._charger_serial)
        if feat and feat.max_current_a and feat.max_current_a > 0:
            return float(feat.max_current_a)
        return 32.0

    @property
    def native_step(self) -> float:
        return 1.0

    @property
    def native_value(self) -> float | None:
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
        if conn and conn.current_a is not None:
            return float(conn.current_a)
        return None

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_connector_mode(
            self._charger_serial,
            self._connector_position,
            CHARGING_MODE_NORMAL,
            current_a=float(value),
        )
        await self.coordinator.async_request_refresh()
