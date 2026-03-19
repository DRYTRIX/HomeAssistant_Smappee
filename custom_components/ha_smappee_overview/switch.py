"""Charger availability switch (when API supports PATCH)."""

from __future__ import annotations

import logging

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DATA_COORDINATOR, DOMAIN
from .coordinator import SmappeeOverviewCoordinator
from .entity import charger_device_info

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmappeeOverviewCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        DATA_COORDINATOR
    ]
    added: set[str] = set()

    def _discover(_: object | None = None) -> None:
        serials = {c.serial for c in coordinator.data.chargers}
        new_serials = serials - added
        if not new_serials:
            return
        entities = [
            SmappeeChargerAvailabilitySwitch(coordinator, serial)
            for serial in sorted(new_serials)
        ]
        async_add_entities(entities)
        added.update(new_serials)

    _discover()
    config_entry.async_on_unload(coordinator.async_add_listener(_discover))


class SmappeeChargerAvailabilitySwitch(CoordinatorEntity, SwitchEntity):
    """Toggle charger public availability."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: SmappeeOverviewCoordinator, charger_serial: str) -> None:
        super().__init__(coordinator)
        self._charger_serial = charger_serial
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{charger_serial}_availability"
        self._attr_device_info = charger_device_info(coordinator, charger_serial)
        self.entity_description = SwitchEntityDescription(
            key=f"availability_{charger_serial}",
            translation_key="charger_availability_switch",
        )

    @property
    def available(self) -> bool:
        if not self.coordinator.last_update_success:
            return False
        feat = self.coordinator.data.charger_features.get(self._charger_serial)
        if feat is not None and feat.supports_availability_patch is False:
            return False
        return any(c.serial == self._charger_serial for c in self.coordinator.data.chargers)

    @property
    def is_on(self) -> bool | None:
        ch = next(
            (c for c in self.coordinator.data.chargers if c.serial == self._charger_serial),
            None,
        )
        if ch is None:
            return None
        return ch.availability

    async def async_turn_on(self) -> None:
        ok = await self.coordinator.async_set_charger_availability(
            self._charger_serial, True
        )
        if not ok:
            _LOGGER.warning(
                "Charger availability API not supported for %s", self._charger_serial
            )
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self) -> None:
        ok = await self.coordinator.async_set_charger_availability(
            self._charger_serial, False
        )
        if not ok:
            _LOGGER.warning(
                "Charger availability API not supported for %s", self._charger_serial
            )
        await self.coordinator.async_request_refresh()
