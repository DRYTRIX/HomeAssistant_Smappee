"""Sensors for energy overview."""

from __future__ import annotations

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from datetime import UTC, datetime

from homeassistant.const import PERCENTAGE, UnitOfElectricPotential, UnitOfEnergy, UnitOfPower
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import SmappeeOverviewCoordinator
from .entity import SmappeeEntity


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors."""
    coordinator: SmappeeOverviewCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        "coordinator"
    ]
    entities: list[SmappeeSensor] = []
    for desc in SENSOR_TYPES:
        entities.append(SmappeeSensor(coordinator, desc))
    async_add_entities(entities)


SENSOR_TYPES: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key="grid_import",
        translation_key="grid_import",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="grid_export",
        translation_key="grid_export",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="solar",
        translation_key="solar_power",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="consumption",
        translation_key="total_consumption",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="battery_flow",
        translation_key="battery_flow",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="always_on",
        translation_key="always_on",
        native_unit_of_measurement=UnitOfPower.WATT,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="self_consumption",
        translation_key="self_consumption",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="self_sufficiency",
        translation_key="self_sufficiency",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="last_update",
        translation_key="last_successful_sync",
        device_class=SensorDeviceClass.TIMESTAMP,
    ),
    SensorEntityDescription(
        key="battery_soc",
        translation_key="battery_soc",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="phase_l1_voltage",
        translation_key="phase_l1_voltage",
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    SensorEntityDescription(
        key="phase_l2_voltage",
        translation_key="phase_l2_voltage",
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    SensorEntityDescription(
        key="phase_l3_voltage",
        translation_key="phase_l3_voltage",
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        entity_registry_enabled_default=False,
    ),
    SensorEntityDescription(
        key="active_charging_energy",
        translation_key="active_charging_energy",
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    SensorEntityDescription(
        key="tariff_primary",
        translation_key="tariff_primary",
    ),
    SensorEntityDescription(
        key="submeter_count",
        translation_key="submeter_count",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="reimbursement_pending",
        translation_key="reimbursement_pending",
    ),
)

_ATTR_MAP = {
    "grid_import": "grid_import_w",
    "grid_export": "grid_export_w",
    "solar": "solar_w",
    "consumption": "consumption_w",
    "battery_flow": "battery_flow_w",
    "always_on": "always_on_w",
    "self_consumption": "self_consumption_pct",
    "self_sufficiency": "self_sufficiency_pct",
}


class SmappeeSensor(SmappeeEntity, SensorEntity):
    """Energy metric sensor."""

    @property
    def available(self) -> bool:
        key = self.entity_description.key
        if key.startswith("phase_") and key.endswith("_voltage"):
            c = self.coordinator.data.consumption
            pm = c.phase_metrics if c else None
            if not pm:
                return False
            idx = {"phase_l1_voltage": pm.l1_voltage, "phase_l2_voltage": pm.l2_voltage, "phase_l3_voltage": pm.l3_voltage}
            return idx.get(key) is not None
        if key == "battery_soc":
            c = self.coordinator.data.consumption
            return bool(c and c.battery_soc_pct is not None)
        return super().available

    @property
    def native_value(self) -> float | str | None:
        key = self.entity_description.key
        c = self.coordinator.data.consumption
        if key == "last_update":
            lu = self.coordinator.data.last_successful_update
            if lu is None:
                return None
            if lu.tzinfo is None:
                return lu.replace(tzinfo=UTC)
            return lu
        if key == "battery_soc":
            return c.battery_soc_pct if c else None
        if key == "phase_l1_voltage":
            return c.phase_metrics.l1_voltage if c and c.phase_metrics else None
        if key == "phase_l2_voltage":
            return c.phase_metrics.l2_voltage if c and c.phase_metrics else None
        if key == "phase_l3_voltage":
            return c.phase_metrics.l3_voltage if c and c.phase_metrics else None
        if key == "active_charging_energy":
            total = 0.0
            for s in self.coordinator.data.sessions_active:
                if s.energy_wh:
                    total += s.energy_wh / 1000.0
            return round(total, 3) if total else None
        if key == "tariff_primary":
            t = self.coordinator.data.tariffs
            return t[0].name or t[0].id if t else None
        if key == "submeter_count":
            return len(c.submeters) if c else 0
        if key == "reimbursement_pending":
            m = self.coordinator.data.reimbursement_monthly
            if m is None:
                return None
            return f"{m.pending_amount} {self.coordinator.data.reimbursement.currency if self.coordinator.data.reimbursement else 'EUR'}"
        if c is None:
            return None
        attr = _ATTR_MAP.get(key)
        if not attr:
            return None
        return getattr(c, attr, None)

    @property
    def extra_state_attributes(self) -> dict[str, bool | str | None]:
        c = self.coordinator.data.consumption
        if self.entity_description.key == "last_update":
            return {
                "api_partial": self.coordinator.data.api_partial,
                "last_error": self.coordinator.data.last_error,
            }
        return {
            "stale": c.stale if c else True,
            "api_partial": self.coordinator.data.api_partial,
        }
