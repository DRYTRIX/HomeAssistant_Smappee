"""Panel payload helpers: today cost estimate and EV power estimate."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.models import (
    ChargingSession,
    ConnectorState,
    ConsumptionSummary,
    EVCharger,
    PhaseMetrics,
)
from ha_smappee_overview.panel_payload import (
    _compute_today_charging_cost_estimate,
    _estimate_ev_power_w,
)


def test_today_charging_cost_estimate_sums_today_sessions() -> None:
    now = datetime.now(UTC)
    start = now.replace(hour=10, minute=0, second=0, microsecond=0)
    s = ChargingSession(
        id="a",
        charger_serial="sn",
        connector=1,
        status="ENDED",
        energy_wh=5000,
        start=start,
    )
    cost = _compute_today_charging_cost_estimate([s], 0.25)
    assert cost == round(5.0 * 0.25, 4)


def test_today_charging_cost_none_without_tariff() -> None:
    s = ChargingSession(
        id="a",
        charger_serial="sn",
        connector=1,
        status="ENDED",
        energy_wh=1000,
        start=datetime.now(UTC),
    )
    assert _compute_today_charging_cost_estimate([s], None) is None


def test_estimate_ev_power_single_phase() -> None:
    co = ConnectorState(
        position=1, mode="NORMAL", current_a=10.0, session_active=True
    )
    ch = EVCharger(serial="s", name="c", connectors=[co])
    pm = PhaseMetrics(l1_voltage=230.0)
    c = ConsumptionSummary(
        timestamp=datetime.now(UTC), phase_metrics=pm
    )
    p = _estimate_ev_power_w([ch], c)
    assert p == round(230.0 * 10.0, 0)


def test_estimate_ev_power_no_session() -> None:
    co = ConnectorState(
        position=1, mode="NORMAL", current_a=10.0, session_active=False
    )
    ch = EVCharger(serial="s", name="c", connectors=[co])
    assert _estimate_ev_power_w([ch], None) is None
