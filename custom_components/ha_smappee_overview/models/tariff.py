"""Tariff DTO (best-effort parsing)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class TariffInfo:
    """Tariff snapshot when API exposes it."""

    id: str | None = None
    name: str | None = None
    currency: str | None = None
    price_per_kwh: float | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
