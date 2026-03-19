"""EV charger and connector models."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal

ConnectorMode = Literal["NORMAL", "SMART", "PAUSED", "UNKNOWN"]


@dataclass(slots=True)
class ConnectorState:
    """Single charging connector."""

    position: int
    mode: ConnectorMode = "UNKNOWN"
    current_a: float | None = None
    session_active: bool = False
    led_brightness_pct: int | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)


@dataclass(slots=True)
class EVCharger:
    """Charging station."""

    serial: str
    name: str
    connectors: list[ConnectorState] = field(default_factory=list)
    availability: bool = True
    last_sync: datetime | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
