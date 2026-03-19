"""Coordinator data container (no Home Assistant imports)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from .models import (
    AlertItem,
    ChargingSession,
    ChargerFeatures,
    ConsumptionSummary,
    DiscoverySnapshot,
    EVCharger,
    Installation,
    InstallationFeatures,
    ReimbursementConfig,
    ReimbursementSummary,
    TariffInfo,
)


@dataclass
class SmappeeCoordinatorData:
    """All data surfaced to entities and panel."""

    installation: Installation | None = None
    installation_features: InstallationFeatures = field(
        default_factory=InstallationFeatures
    )
    charger_features: dict[str, ChargerFeatures] = field(default_factory=dict)
    consumption: ConsumptionSummary | None = None
    chargers: list[EVCharger] = field(default_factory=list)
    sessions_active: list[ChargingSession] = field(default_factory=list)
    sessions_recent: list[ChargingSession] = field(default_factory=list)
    tariffs: list[TariffInfo] = field(default_factory=list)
    alerts: list[AlertItem] = field(default_factory=list)
    reimbursement: ReimbursementConfig | None = None
    reimbursement_monthly: ReimbursementSummary | None = None
    last_successful_update: datetime | None = None
    last_error: str | None = None
    api_partial: bool = False
    discovery: DiscoverySnapshot = field(default_factory=DiscoverySnapshot)
    discovery_last_observed: dict[str, datetime] = field(default_factory=dict)
