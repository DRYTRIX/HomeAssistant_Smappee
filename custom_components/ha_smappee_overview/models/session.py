"""Charging session model."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class ChargingSession:
    """One charging session record."""

    id: str
    charger_serial: str
    connector: int
    status: str
    energy_wh: float | None = None
    duration_s: int | None = None
    start: datetime | None = None
    end: datetime | None = None
    user_id: str | None = None
    card_id: str | None = None
    user_label: str | None = None
    card_label: str | None = None
    solar_share_pct: float | None = None
    cost_amount: float | None = None
    cost_currency: str | None = None
    tariff_id: str | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
