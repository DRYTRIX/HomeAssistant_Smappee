"""Panel serialization and coordinator data (no Home Assistant)."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.coordinator_data import SmappeeCoordinatorData
from ha_smappee_overview.models import ConsumptionSummary, Installation
from ha_smappee_overview.models import DiscoveryNode, DiscoverySnapshot
from ha_smappee_overview.panel_serialize import (
    build_discovery_payload,
    consumption_to_dict,
    panel_data_dict,
)


def test_consumption_to_dict() -> None:
    now = datetime.now(UTC)
    c = ConsumptionSummary(
        timestamp=now,
        stale=False,
        grid_import_w=1.0,
        submeters=[],
    )
    d = consumption_to_dict(c)
    assert d is not None
    assert d["grid_import_w"] == 1.0
    assert d["stale"] is False


def test_coordinator_data_defaults() -> None:
    data = SmappeeCoordinatorData(
        installation=Installation(id=1, name="X"),
    )
    assert data.chargers == []
    assert data.api_partial is False


def test_panel_data_dict_shape() -> None:
    data = SmappeeCoordinatorData(
        installation=Installation(id=1, name="Home"),
        consumption=ConsumptionSummary(timestamp=datetime.now(UTC)),
    )
    d = panel_data_dict(data)
    assert d["installation"] == {"id": 1, "name": "Home"}
    assert "consumption" in d
    assert d["chargers"] == []
    assert d["installation_features"]["has_three_phase"] is False
    assert d["tariffs"] == []
    assert d["alerts"] == []


def test_build_discovery_payload_shape() -> None:
    now = datetime.now(UTC)
    node = DiscoveryNode(
        node_id="installation:1",
        kind="installation",
        label="Home",
        serial=None,
        parent_serial=None,
    )
    snap = DiscoverySnapshot(
        nodes=[node],
        edges=[],
        partial=False,
        notes=[],
        sources={"devices_from_sl": False, "chargers_from_v3": False},
        generated_at=now,
    )
    data = SmappeeCoordinatorData(discovery=snap, discovery_last_observed={node.node_id: now})
    out = build_discovery_payload(
        data,
        update_interval_s=60,
        coordinator_last_update_success=True,
        consumption_stale=False,
    )
    assert out["partial"] is False
    assert len(out["nodes"]) == 1
    assert out["nodes"][0]["health"]["connectivity"] == "ok"
    assert out["summary"]["ok"] >= 1
