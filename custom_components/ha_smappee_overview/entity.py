"""Base entity for Smappee Overview."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_SERVICE_LOCATION_ID, DOMAIN
from .coordinator import SmappeeOverviewCoordinator


def charger_device_info(
    coordinator: SmappeeOverviewCoordinator, charger_serial: str
) -> DeviceInfo:
    """Device info for a charging station."""
    entry = coordinator.config_entry
    sl = str(entry.data.get(CONF_SERVICE_LOCATION_ID, entry.entry_id))
    ch = next(
        (c for c in coordinator.data.chargers if c.serial == charger_serial),
        None,
    )
    name = ch.name if ch else charger_serial
    return DeviceInfo(
        identifiers={(DOMAIN, f"{sl}_{charger_serial}")},
        name=name,
        manufacturer="Smappee",
        model="EV charger",
        via_device={(DOMAIN, sl)},
    )


class SmappeeEntity(CoordinatorEntity[SmappeeOverviewCoordinator]):
    """Base class."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: SmappeeOverviewCoordinator,
        description: EntityDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, str(entry.data.get(CONF_SERVICE_LOCATION_ID, entry.entry_id)))},
            name=entry.title,
            manufacturer="Smappee",
            model="Service location",
        )
