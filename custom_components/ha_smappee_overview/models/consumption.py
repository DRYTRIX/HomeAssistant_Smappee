"""Consumption and submeter models."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class PhaseMetrics:
    """Per-phase electrical metrics when exposed by the monitor."""

    l1_voltage: float | None = None
    l2_voltage: float | None = None
    l3_voltage: float | None = None
    l1_current: float | None = None
    l2_current: float | None = None
    l3_current: float | None = None
    l1_power_w: float | None = None
    l2_power_w: float | None = None
    l3_power_w: float | None = None


@dataclass(slots=True)
class Submeter:
    """Per-circuit / load."""

    id: str
    name: str
    power_w: float | None = None
    energy_wh: float | None = None
    phase: int | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)


@dataclass(slots=True)
class ConsumptionSummary:
    """Aggregated energy snapshot."""

    timestamp: datetime
    stale: bool = False
    grid_import_w: float | None = None
    grid_export_w: float | None = None
    solar_w: float | None = None
    consumption_w: float | None = None
    battery_flow_w: float | None = None
    always_on_w: float | None = None
    gas_m3: float | None = None
    water_m3: float | None = None
    self_consumption_pct: float | None = None
    self_sufficiency_pct: float | None = None
    battery_soc_pct: float | None = None
    phase_metrics: PhaseMetrics | None = None
    submeters: list[Submeter] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
