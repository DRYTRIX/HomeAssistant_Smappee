"""Parse service-location device lists and merge with charging-station API data."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from ..models import DiscoveryEdge, DiscoveryNode, DiscoverySnapshot, EVCharger, Installation

_LOGGER = logging.getLogger(__name__)

# Heuristic tokens in stringly-typed API fields (deviceType, type, productType, …).
_CHARGER_HINTS = frozenset(
    ("charger", "ev", "wall", "charging", "charge", "station", "ocpp")
)
_MONITOR_HINTS = frozenset(
    ("monitor", "energy", "sense", "pro", "ultra", "plus", "home", "solar", "meter")
)
_GATEWAY_HINTS = frozenset(("gateway", "hub", "connect", "bridge"))


def _lower_blob(row: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in (
        "deviceType",
        "type",
        "productType",
        "role",
        "category",
        "name",
        "model",
        "deviceSubType",
    ):
        v = row.get(key)
        if isinstance(v, str) and v.strip():
            parts.append(v.lower())
        elif v is not None and not isinstance(v, (dict, list)):
            parts.append(str(v).lower())
    return " ".join(parts)


def classify_device_kind(blob: str) -> str:
    """Return monitor | gateway | charger | unknown."""
    if any(h in blob for h in _CHARGER_HINTS):
        return "charger"
    if any(h in blob for h in _GATEWAY_HINTS):
        return "gateway"
    if any(h in blob for h in _MONITOR_HINTS):
        return "monitor"
    return "unknown"


def _device_row_id(row: dict[str, Any]) -> str | None:
    serial = row.get("serialNumber") or row.get("serial")
    if serial is not None and str(serial).strip():
        return str(serial).strip()
    uid = row.get("uuid") or row.get("deviceUuid")
    if uid is not None and str(uid).strip():
        return f"uuid:{str(uid).strip()}"
    did = row.get("id") or row.get("deviceId")
    if did is not None and str(did).strip():
        return f"id:{str(did).strip()}"
    return None


def _parent_serial(row: dict[str, Any]) -> str | None:
    for key in (
        "parentSerial",
        "parentSerialNumber",
        "gatewaySerial",
        "parentDeviceSerial",
        "parentSerialnumber",
    ):
        v = row.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return None


def _parse_api_bool(v: Any) -> bool | None:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(v)
    if isinstance(v, str):
        low = v.strip().lower()
        if low in ("true", "1", "yes", "online", "connected"):
            return True
        if low in ("false", "0", "no", "offline", "disconnected"):
            return False
    return None


def _parse_last_seen_ms(row: dict[str, Any]) -> datetime | None:
    for key in (
        "lastCommunication",
        "lastCommunicationTime",
        "lastSeen",
        "lastSeenTime",
        "lastUpdate",
        "lastUpdateTime",
    ):
        v = row.get(key)
        if v is None:
            continue
        try:
            ms = int(v)
            return datetime.fromtimestamp(ms / 1000.0, tz=UTC)
        except (TypeError, ValueError, OSError):
            continue
    return None


def _online_from_row(row: dict[str, Any]) -> bool | None:
    for key in ("online", "connected", "reachable", "isOnline", "cloudConnected"):
        if key in row:
            return _parse_api_bool(row.get(key))
    return None


def iter_device_dicts(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Collect device-like dicts from a service-location payload."""
    out: list[dict[str, Any]] = []
    if not isinstance(raw, dict):
        return out
    devs = raw.get("devices")
    if isinstance(devs, list):
        for d in devs:
            if isinstance(d, dict):
                out.append(d)
    alt = raw.get("deviceList") or raw.get("hardware")
    if isinstance(alt, list):
        for d in alt:
            if isinstance(d, dict):
                out.append(d)
    return out


def parse_smappee_devices(rows: list[dict[str, Any]]) -> list[DiscoveryNode]:
    """Map raw device rows to discovery nodes (no charger API merge)."""
    nodes: list[DiscoveryNode] = []
    seen: set[str] = set()
    for row in rows:
        nid = _device_row_id(row)
        if not nid:
            _LOGGER.debug("Skipping device row without id keys: %s", list(row.keys())[:12])
            continue
        if nid in seen:
            continue
        seen.add(nid)
        blob = _lower_blob(row)
        kind_s = classify_device_kind(blob)
        label = str(row.get("name") or row.get("label") or row.get("deviceName") or nid)
        serial = None
        s = row.get("serialNumber") or row.get("serial")
        if isinstance(s, str) and s.strip():
            serial = s.strip()
        nodes.append(
            DiscoveryNode(
                node_id=nid,
                kind=kind_s,  # type: ignore[arg-type]
                label=label[:200],
                serial=serial,
                parent_serial=_parent_serial(row),
                raw_keys=tuple(sorted(str(k) for k in row.keys()))[:40],
                source_sl_devices=True,
                api_online=_online_from_row(row),
                api_last_seen=_parse_last_seen_ms(row),
            )
        )
    return nodes


def _installation_node(installation: Installation) -> DiscoveryNode:
    iid = installation.id
    root_id = f"installation:{iid}"
    return DiscoveryNode(
        node_id=root_id,
        kind="installation",
        label=installation.name,
        serial=installation.serial,
        parent_serial=None,
        raw_keys=tuple(sorted(str(k) for k in installation.raw.keys()))[:25]
        if isinstance(installation.raw, dict)
        else (),
        source_sl_devices=False,
        source_charging_api=False,
    )


def _edges_for_nodes(
    nodes: list[DiscoveryNode], installation_id: str
) -> list[DiscoveryEdge]:
    serial_to_id: dict[str, str] = {}
    for n in nodes:
        if n.serial:
            serial_to_id[n.serial] = n.node_id
    edges: list[DiscoveryEdge] = []
    seen_e: set[tuple[str, str]] = set()
    for n in nodes:
        if n.kind == "installation":
            continue
        ps = n.parent_serial
        if ps and ps in serial_to_id:
            p = serial_to_id[ps]
            t = (p, n.node_id)
            if t not in seen_e:
                seen_e.add(t)
                edges.append(DiscoveryEdge(parent_id=p, child_id=n.node_id))
        else:
            t = (installation_id, n.node_id)
            if t not in seen_e:
                seen_e.add(t)
                edges.append(DiscoveryEdge(parent_id=installation_id, child_id=n.node_id))
    return edges


def merge_discovery(
    installation: Installation | None,
    chargers: list[EVCharger],
    *,
    device_rows: list[dict[str, Any]],
    detail_fetch_used: bool,
) -> DiscoverySnapshot:
    """Merge servicelocation device rows with charging-station list."""
    notes: list[str] = []
    partial = False
    sources: dict[str, bool] = {
        "devices_from_sl": bool(device_rows),
        "chargers_from_v3": bool(chargers),
        "detail_fetch_used": detail_fetch_used,
    }

    if installation is None:
        partial = True
        notes.append("No installation metadata; showing chargers only if available.")
        by_id: dict[str, DiscoveryNode] = {}
    else:
        root = _installation_node(installation)
        nodes_from_sl = parse_smappee_devices(device_rows)
        by_id = {root.node_id: root}
        for n in nodes_from_sl:
            by_id[n.node_id] = n
        if not device_rows:
            partial = True
            notes.append(
                "No devices[] on service location; topology may be incomplete. "
                "See docs/API_CAPTURE.md for sample payloads."
            )

    for ch in chargers:
        if not ch.serial:
            continue
        cn = ch.raw if isinstance(ch.raw, dict) else {}
        blob = _lower_blob(cn)
        kind_s: str = classify_device_kind(blob)
        if kind_s == "unknown":
            kind_s = "charger"
        if ch.serial in by_id:
            ex = by_id[ch.serial]
            ex.source_charging_api = True
            ex.kind = "charger"  # type: ignore[assignment]
            ex.label = ch.name or ex.label
            ex.availability = ch.availability
            ex.connector_count = len(ch.connectors)
            if ex.api_online is None:
                ex.api_online = _online_from_row(cn)
            if ex.api_last_seen is None:
                ex.api_last_seen = _parse_last_seen_ms(cn)
        else:
            by_id[ch.serial] = DiscoveryNode(
                node_id=ch.serial,
                kind="charger",
                label=ch.name or ch.serial,
                serial=ch.serial,
                parent_serial=None,
                raw_keys=tuple(sorted(str(k) for k in cn.keys()))[:40],
                source_sl_devices=False,
                source_charging_api=True,
                api_online=_online_from_row(cn),
                api_last_seen=_parse_last_seen_ms(cn),
                availability=ch.availability,
                connector_count=len(ch.connectors),
            )

    nodes = list(by_id.values())
    if installation is not None:
        root_id = f"installation:{installation.id}"
        edges = _edges_for_nodes(nodes, root_id)
    else:
        edges = []

    if not chargers and not device_rows:
        partial = True
        notes.append("No chargers and no hardware devices from the API.")

    return DiscoverySnapshot(
        nodes=nodes,
        edges=edges,
        partial=partial,
        notes=notes,
        sources=sources,
        generated_at=datetime.now(UTC),
    )
