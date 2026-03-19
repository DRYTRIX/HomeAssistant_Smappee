"""Reimbursement / split-billing models."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class ReimbursementRateHistory:
    """Historical rate entry."""

    valid_from: datetime
    rate_per_kwh: float
    currency: str = "EUR"


@dataclass(slots=True)
class ReimbursementConfig:
    """User-configured reimbursement."""

    rate_per_kwh: float = 0.0
    currency: str = "EUR"
    valid_from: datetime | None = None
    belgium_cap_eur_per_kwh: float | None = None
    history: list[ReimbursementRateHistory] = field(default_factory=list)


@dataclass(slots=True)
class ReimbursementSummary:
    """Monthly aggregates (computed + API fallbacks)."""

    month: str  # YYYY-MM
    total_kwh: float = 0.0
    reimbursed_amount: float = 0.0
    pending_amount: float = 0.0
    sessions_count: int = 0
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
