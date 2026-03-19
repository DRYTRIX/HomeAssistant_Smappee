"""Charging explanation engine unit tests."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from ha_smappee_overview.charging_explanation import (
    build_connector_explanations,
    explain_connector,
    parse_load_balance_amps,
)
from ha_smappee_overview.models import (
    ChargerFeatures,
    ChargingSession,
    ConnectorState,
    ConsumptionSummary,
    EVCharger,
)


def test_parse_load_balance_amps_nested() -> None:
    assert parse_load_balance_amps({"availableCurrent": 12}) == pytest.approx(12.0)
    assert parse_load_balance_amps({"nested": {"max_current": 20}}) == pytest.approx(20.0)


def test_explain_idle_no_session() -> None:
    ch = EVCharger(
        serial="S",
        name="Box",
        connectors=[ConnectorState(position=1, mode="NORMAL", session_active=False)],
    )
    co = ch.connectors[0]
    expl = explain_connector(
        None,
        ch,
        co,
        None,
        ChargerFeatures(serial="S", max_current_a=32.0),
        {"reported": False, "value": None},
    )
    assert expl["status"] == "idle"
    assert expl["reason"] == "idle"
    assert expl["suggestions"] == []


def test_explain_grid_capacity_when_lb_below_set_current() -> None:
    ch = EVCharger(
        serial="S",
        name="Box",
        connectors=[
            ConnectorState(position=1, mode="NORMAL", current_a=16.0, session_active=True)
        ],
    )
    co = ch.connectors[0]
    sess = ChargingSession(
        id="x",
        charger_serial="S",
        connector=1,
        status="CHARGING",
        start=datetime.now(UTC),
    )
    expl = explain_connector(
        None,
        ch,
        co,
        sess,
        ChargerFeatures(serial="S", max_current_a=32.0),
        {"reported": True, "value": {"availableCurrent": 10}, "source_key": "loadBalancing"},
    )
    assert expl["status"] == "limited"
    assert expl["reason"] == "grid_capacity_limit"
    assert "dynamic_limit_a" in expl["details"]


def test_explain_smart_mode_charging_not_grid_limited() -> None:
    ch = EVCharger(
        serial="S",
        name="Box",
        connectors=[
            ConnectorState(position=1, mode="SMART", current_a=16.0, session_active=True)
        ],
    )
    co = ch.connectors[0]
    sess = ChargingSession(
        id="x",
        charger_serial="S",
        connector=1,
        status="CHARGING",
        start=datetime.now(UTC),
    )
    expl = explain_connector(
        None,
        ch,
        co,
        sess,
        ChargerFeatures(serial="S", max_current_a=32.0),
        {"reported": False, "value": None},
    )
    assert expl["status"] == "charging"
    assert expl["reason"] == "smart_charging"


def test_explain_solar_wait_low_solar() -> None:
    ch = EVCharger(
        serial="S",
        name="Box",
        connectors=[ConnectorState(position=1, mode="PAUSED", session_active=True)],
    )
    co = ch.connectors[0]
    sess = ChargingSession(
        id="x",
        charger_serial="S",
        connector=1,
        status="PAUSED_SMART_WAIT",
        start=datetime.now(UTC),
    )
    cons = ConsumptionSummary(timestamp=datetime.now(UTC), solar_w=100.0)
    expl = explain_connector(
        cons,
        ch,
        co,
        sess,
        ChargerFeatures(serial="S", max_current_a=32.0),
        {"reported": False, "value": None},
    )
    assert expl["reason"] == "solar_wait"
    assert expl["status"] == "waiting"


def test_explain_overload_source_key() -> None:
    ch = EVCharger(serial="S", name="Box", connectors=[ConnectorState(position=1)])
    co = ch.connectors[0]
    sess = ChargingSession(
        id="x",
        charger_serial="S",
        connector=1,
        status="PAUSED",
        start=datetime.now(UTC),
    )
    expl = explain_connector(
        None,
        ch,
        co,
        sess,
        None,
        {"reported": True, "value": {}, "source_key": "overloadState"},
    )
    assert expl["reason"] == "overload_protection"


def test_build_connector_explanations_one_per_connector() -> None:
    ch = EVCharger(
        serial="A",
        name="A",
        connectors=[
            ConnectorState(position=1),
            ConnectorState(position=2),
        ],
    )
    rows = build_connector_explanations(
        None,
        [ch],
        {"A": ChargerFeatures(serial="A", max_current_a=32.0)},
        [{"serial": "A", "load_balance": {"reported": False, "value": None}}],
        [],
        [],
    )
    assert len(rows) == 2
    for r in rows:
        assert "charger_serial" in r
        assert "connector" in r
        assert "explanation" in r
        e = r["explanation"]
        assert "status" in e and "reason" in e and "message" in e
        assert "badge" in e and "suggestions" in e and "technical" in e
