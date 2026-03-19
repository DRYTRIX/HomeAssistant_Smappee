"""Cloud-derived device discovery (service location + chargers)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal

DeviceNodeKind = Literal["installation", "monitor", "gateway", "charger", "unknown"]


@dataclass(slots=True)
class DiscoveryEdge:
    """Optional parent/child link for topology."""

    parent_id: str
    child_id: str


@dataclass(slots=True)
class DiscoveryNode:
    """Single discovered device or the installation root."""

    node_id: str
    kind: DeviceNodeKind
    label: str
    serial: str | None
    parent_serial: str | None
    raw_keys: tuple[str, ...] = field(default_factory=tuple)
    source_sl_devices: bool = False
    source_charging_api: bool = False
    api_online: bool | None = None
    api_last_seen: datetime | None = None
    availability: bool | None = None
    connector_count: int | None = None


@dataclass(slots=True)
class DiscoverySnapshot:
    """Merged discovery for one service location."""

    nodes: list[DiscoveryNode] = field(default_factory=list)
    edges: list[DiscoveryEdge] = field(default_factory=list)
    partial: bool = False
    notes: list[str] = field(default_factory=list)
    sources: dict[str, bool] = field(default_factory=dict)
    generated_at: datetime | None = None
