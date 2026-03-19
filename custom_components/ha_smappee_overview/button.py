"""Panel refresh and charger quick actions."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CHARGING_MODE_NORMAL, CHARGING_MODE_PAUSED, DOMAIN
from .coordinator import SmappeeOverviewCoordinator
from .entity import SmappeeEntity, charger_device_info


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmappeeOverviewCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        "coordinator"
    ]
    base = [SmappeeRefreshButton(coordinator)]
    added_charger: set[str] = set()

    def _discover(_: object | None = None) -> None:
        new = [c.serial for c in coordinator.data.chargers if c.serial not in added_charger]
        if not new:
            return
        entities: list[ButtonEntity] = []
        for serial in sorted(new):
            entities.append(SmappeePauseChargingButton(coordinator, serial))
            entities.append(SmappeeStartChargingButton(coordinator, serial))
        async_add_entities(entities)
        added_charger.update(new)

    async_add_entities(base)
    _discover()
    config_entry.async_on_unload(coordinator.async_add_listener(_discover))


class SmappeeRefreshButton(SmappeeEntity, ButtonEntity):
    """Force coordinator refresh."""

    entity_description = ButtonEntityDescription(
        key="refresh_data",
        translation_key="refresh_data",
    )

    def __init__(self, coordinator: SmappeeOverviewCoordinator) -> None:
        super().__init__(coordinator, self.entity_description)

    async def async_press(self) -> None:
        await self.coordinator.async_request_refresh()


class SmappeePauseChargingButton(CoordinatorEntity, ButtonEntity):
    """Pause charging on connector 1 (convenience)."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: SmappeeOverviewCoordinator, charger_serial: str) -> None:
        super().__init__(coordinator)
        self._charger_serial = charger_serial
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{charger_serial}_pause_btn"
        self._attr_device_info = charger_device_info(coordinator, charger_serial)
        self.entity_description = ButtonEntityDescription(
            key=f"pause_{charger_serial}",
            translation_key="pause_charging_button",
        )

    async def async_press(self) -> None:
        client = self.hass.data[DOMAIN][self.coordinator.config_entry.entry_id]["client"]
        await client.set_connector_mode(
            self._charger_serial,
            1,
            CHARGING_MODE_PAUSED,
        )
        await self.coordinator.async_request_refresh()


class SmappeeStartChargingButton(CoordinatorEntity, ButtonEntity):
    """Start charging on connector 1 (NORMAL, no current cap)."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: SmappeeOverviewCoordinator, charger_serial: str) -> None:
        super().__init__(coordinator)
        self._charger_serial = charger_serial
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{charger_serial}_start_btn"
        self._attr_device_info = charger_device_info(coordinator, charger_serial)
        self.entity_description = ButtonEntityDescription(
            key=f"start_{charger_serial}",
            translation_key="start_charging_button",
        )

    async def async_press(self) -> None:
        client = self.hass.data[DOMAIN][self.coordinator.config_entry.entry_id]["client"]
        await client.set_connector_mode(
            self._charger_serial,
            1,
            CHARGING_MODE_NORMAL,
        )
        await self.coordinator.async_request_refresh()
