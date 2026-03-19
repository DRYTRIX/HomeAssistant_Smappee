"""Domain model construction."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.models import ConsumptionSummary, Installation, Submeter


def test_installation_frozen() -> None:
    inst = Installation(id=1, name="Home", uuid="u", timezone="Europe/Brussels")
    assert inst.id == 1
    assert inst.name == "Home"


def test_consumption_summary_optional_fields() -> None:
    now = datetime.now(UTC)
    c = ConsumptionSummary(timestamp=now, stale=True, grid_import_w=1500.0)
    assert c.solar_w is None
    assert c.stale is True


def test_submeter() -> None:
    sm = Submeter(id="1", name="Kitchen", power_w=200.0)
    assert sm.energy_wh is None
