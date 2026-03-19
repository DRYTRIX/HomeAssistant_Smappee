"""Shared UTC timestamp parsing helpers."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

# Accept realistic epoch-ms values between 2000-01-01 and 2100-01-01.
_MIN_VALID_EPOCH_MS = 946684800000
_MAX_VALID_EPOCH_MS = 4102444800000


def parse_utc_epoch_ms(value: Any) -> datetime | None:
    """Parse epoch milliseconds into aware UTC datetime."""
    if value is None:
        return None
    try:
        ms = int(value)
    except (TypeError, ValueError):
        return None
    if ms < _MIN_VALID_EPOCH_MS or ms > _MAX_VALID_EPOCH_MS:
        return None
    try:
        return datetime.fromtimestamp(ms / 1000.0, tz=UTC)
    except (OSError, OverflowError, ValueError):
        return None


def ensure_utc(dt: datetime | None) -> datetime | None:
    """Normalize datetime to aware UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)
