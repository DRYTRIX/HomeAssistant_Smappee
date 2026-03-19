"""Device discovery parsing and merge (pure)."""

from __future__ import annotations

from ha_smappee_overview.api.discovery import (
    classify_device_kind,
    iter_device_dicts,
    merge_discovery,
    parse_smappee_devices,
)
from ha_smappee_overview.models import EVCharger, Installation


def test_classify_device_kind_charger() -> None:
    assert classify_device_kind("ev wall charger ocpp") == "charger"


def test_classify_device_kind_monitor() -> None:
    assert classify_device_kind("smappee energy monitor ultra") == "monitor"


def test_parse_smappee_devices_serial_and_parent() -> None:
    rows = [
        {
            "serialNumber": "GW-1",
            "name": "Gateway",
            "deviceType": "GATEWAY",
        },
        {
            "serialNumber": "MON-1",
            "name": "Monitor",
            "deviceType": "ENERGY_MONITOR",
            "parentSerial": "GW-1",
        },
    ]
    nodes = parse_smappee_devices(rows)
    assert len(nodes) == 2
    by_serial = {n.serial: n for n in nodes if n.serial}
    assert by_serial["GW-1"].kind == "gateway"
    assert by_serial["MON-1"].kind == "monitor"
    assert by_serial["MON-1"].parent_serial == "GW-1"


def test_merge_discovery_installation_and_charger() -> None:
    inst = Installation(
        id=7,
        name="Home",
        raw={
            "serviceLocationId": 7,
            "devices": [
                {
                    "serialNumber": "CHG-1",
                    "name": "Wall",
                    "deviceType": "EV_CHARGER",
                }
            ],
        },
    )
    ch = EVCharger(
        serial="CHG-1",
        name="Wall live",
        availability=True,
        raw={"serialNumber": "CHG-1", "maxCurrent": 32},
    )
    snap = merge_discovery(
        inst,
        [ch],
        device_rows=iter_device_dicts(inst.raw),
        detail_fetch_used=False,
    )
    assert any(n.kind == "installation" for n in snap.nodes)
    chg_nodes = [n for n in snap.nodes if n.serial == "CHG-1"]
    assert len(chg_nodes) == 1
    assert chg_nodes[0].source_sl_devices is True
    assert chg_nodes[0].source_charging_api is True
    assert chg_nodes[0].connector_count == 0
    assert snap.edges


def test_merge_discovery_charger_only_from_api() -> None:
    inst = Installation(id=1, name="X", raw={})
    ch = EVCharger(serial="S9", name="C9", raw={})
    snap = merge_discovery(inst, [ch], device_rows=[], detail_fetch_used=True)
    assert snap.partial
    serials = {n.serial for n in snap.nodes}
    assert "S9" in serials
