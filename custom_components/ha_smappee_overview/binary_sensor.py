"""Binary sensors for EV / charger state."""

from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DATA_COORDINATOR, DOMAIN
from .coordinator import SmappeeOverviewCoordinator
from .entity import SmappeeEntity


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensors."""
    coordinator: SmappeeOverviewCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        DATA_COORDINATOR
    ]
    async_add_entities(
        [
            SmappeeEvChargingBinarySensor(coordinator),
            SmappeeChargerAvailableBinarySensor(coordinator),
            SmappeeApiPartialBinarySensor(coordinator),
            SmappeeAlertsBinarySensor(coordinator),
        ]
    )


class SmappeeEvChargingBinarySensor(SmappeeEntity, BinarySensorEntity):
    """True when any session is actively charging."""

    entity_description = BinarySensorEntityDescription(
        key="ev_charging",
        translation_key="ev_charging",
        device_class=BinarySensorDeviceClass.RUNNING,
    )

    def __init__(self, coordinator: SmappeeOverviewCoordinator) -> None:
        super().__init__(coordinator, self.entity_description)

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.sessions_active)

    @property
    def extra_state_attributes(self) -> dict[str, int]:
        return {"active_sessions": len(self.coordinator.data.sessions_active)}


class SmappeeChargerAvailableBinarySensor(SmappeeEntity, BinarySensorEntity):
    """True when at least one charger reports available."""

    entity_description = BinarySensorEntityDescription(
        key="charger_available",
        translation_key="charger_available",
    )

    def __init__(self, coordinator: SmappeeOverviewCoordinator) -> None:
        super().__init__(coordinator, self.entity_description)

    @property
    def is_on(self) -> bool:
        chargers = self.coordinator.data.chargers
        if not chargers:
            return False
        return any(c.availability for c in chargers)


class SmappeeApiPartialBinarySensor(SmappeeEntity, BinarySensorEntity):
    """On when last poll had partial API data."""

    entity_description = BinarySensorEntityDescription(
        key="api_partial",
        translation_key="api_partial",
        entity_registry_enabled_default=False,
    )

    def __init__(self, coordinator: SmappeeOverviewCoordinator) -> None:
        super().__init__(coordinator, self.entity_description)

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.api_partial)


class SmappeeAlertsBinarySensor(SmappeeEntity, BinarySensorEntity):
    """On when cloud returned alerts."""

    entity_description = BinarySensorEntityDescription(
        key="alerts_present",
        translation_key="alerts_present",
    )

    def __init__(self, coordinator: SmappeeOverviewCoordinator) -> None:
        super().__init__(coordinator, self.entity_description)

    @property
    def is_on(self) -> bool:
        return len(self.coordinator.data.alerts) > 0

    @property
    def extra_state_attributes(self) -> dict[str, int]:
        return {"alert_count": len(self.coordinator.data.alerts)}
