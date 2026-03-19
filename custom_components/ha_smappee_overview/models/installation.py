"""Installation (service location) domain model."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class Installation:
    """Smappee service location."""

    id: int
    name: str
    uuid: str | None = None
    timezone: str | None = None
    serial: str | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
