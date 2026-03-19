"""Tests for assistant_heuristics (no Home Assistant)."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.assistant_heuristics import build_assistant_suggestions
from ha_smappee_overview.models import (
    ChargingSession,
    ConsumptionSummary,
    ConnectorState,
    EVCharger,
    PhaseMetrics,
)


def _now() -> datetime:
    return datetime.now(UTC)


def test_charge_now_solar_when_export_and_plugged_not_charging() -> None:
    ch = EVCharger(
        serial="s1",
        name="Wallbox",
        connectors=[ConnectorState(position=1, session_active=True)],
    )
    consumption = ConsumptionSummary(
        timestamp=_now(),
        grid_export_w=500,
        solar_w=1000,
        consumption_w=800,
    )
    sess = ChargingSession(
        id="a",
        charger_serial="s1",
        connector=1,
        status="PAUSED",
    )
    out = build_assistant_suggestions(
        consumption,
        [ch],
        [sess],
        tariff_per_kwh=0.35,
        currency="EUR",
        off_peak_price_per_kwh=None,
        assumed_session_kwh=10,
        has_three_phase=False,
    )
    ids = [x["id"] for x in out]
    assert "charge-now-solar" in ids


def test_no_charge_now_when_already_charging() -> None:
    ch = EVCharger(
        serial="s1",
        name="Wallbox",
        connectors=[ConnectorState(position=1, session_active=True)],
    )
    consumption = ConsumptionSummary(
        timestamp=_now(),
        grid_export_w=900,
    )
    sess = ChargingSession(
        id="a",
        charger_serial="s1",
        connector=1,
        status="CHARGING",
    )
    out = build_assistant_suggestions(
        consumption,
        [ch],
        [sess],
        tariff_per_kwh=0.35,
        currency="EUR",
        off_peak_price_per_kwh=None,
        assumed_session_kwh=10,
        has_three_phase=False,
    )
    assert all(x["id"] != "charge-now-solar" for x in out)


def test_delay_save_with_off_peak() -> None:
    consumption = ConsumptionSummary(
        timestamp=_now(),
        grid_import_w=2000,
        solar_w=100,
    )
    out = build_assistant_suggestions(
        consumption,
        [],
        [],
        tariff_per_kwh=0.40,
        currency="EUR",
        off_peak_price_per_kwh=0.15,
        assumed_session_kwh=10,
        has_three_phase=False,
    )
    save = next(x for x in out if x["id"] == "delay-charging-save")
    assert save["savings"]["amount"] == 2.5
    assert "reduce-peak-usage" in {x["id"] for x in out}


def test_qualitative_when_peak_no_off_peak_config() -> None:
    consumption = ConsumptionSummary(
        timestamp=_now(),
        grid_import_w=2000,
        solar_w=100,
    )
    out = build_assistant_suggestions(
        consumption,
        [],
        [],
        tariff_per_kwh=0.40,
        currency="EUR",
        off_peak_price_per_kwh=None,
        assumed_session_kwh=10,
        has_three_phase=False,
    )
    assert any(x["id"] == "delay-charging-qualitative" for x in out)


def test_phase_imbalance() -> None:
    pm = PhaseMetrics(
        l1_power_w=3000,
        l2_power_w=1200,
        l3_power_w=1100,
    )
    consumption = ConsumptionSummary(
        timestamp=_now(),
        grid_import_w=1200,
        phase_metrics=pm,
    )
    out = build_assistant_suggestions(
        consumption,
        [],
        [],
        tariff_per_kwh=None,
        currency="EUR",
        off_peak_price_per_kwh=None,
        assumed_session_kwh=10,
        has_three_phase=True,
    )
    assert any(x["id"] == "phase-imbalance" for x in out)


def test_empty_without_consumption() -> None:
    assert (
        build_assistant_suggestions(
            None,
            [],
            [],
            tariff_per_kwh=0.3,
            currency="EUR",
            off_peak_price_per_kwh=0.1,
            assumed_session_kwh=10,
            has_three_phase=False,
        )
        == []
    )
