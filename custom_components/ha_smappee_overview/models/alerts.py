"""Alert / diagnostic items from cloud."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class AlertItem:
    """Single alert or diagnostic message."""

    id: str
    message: str
    severity: str | None = None
    created_at: datetime | None = None
    raw: dict[str, Any] = field(default_factory=dict, repr=False)
