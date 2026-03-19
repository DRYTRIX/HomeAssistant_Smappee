"""Panel v2 payload shape and enrichment."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest

from ha_smappee_overview.coordinator_data import SmappeeCoordinatorData
from ha_smappee_overview.models import (
    ChargingSession,
    ConnectorState,
    EVCharger,
    Installation,
    ReimbursementConfig,
    ReimbursementSummary,
    TariffInfo,
)
from ha_smappee_overview.panel_payload import build_full_panel_payload


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    er = MagicMock()
    er.entities = MagicMock()
    er.entities.values = MagicMock(return_value=[])

    def async_get(_h):
        return er

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            async_get,
        )
        yield hass


@pytest.fixture
def mock_coordinator():
    coord = MagicMock()
    entry = MagicMock()
    entry.entry_id = "test_entry"
    entry.unique_id = "abc123"
    entry.options = {"update_interval": 60, "country_code": "BE"}
    entry.data = {"service_location_id": 1}
    coord.config_entry = entry
    coord.last_update_success = True

    sess = ChargingSession(
        id="s1",
        charger_serial="CH1",
        connector=1,
        status="COMPLETED",
        energy_wh=5000,
        start=datetime(2025, 3, 18, 10, 0, tzinfo=UTC),
        solar_share_pct=40.0,
    )
    d = SmappeeCoordinatorData(
        installation=Installation(id=1, name="Home"),
        consumption=None,
        tariffs=[TariffInfo(id="t1", price_per_kwh=0.25, currency="EUR")],
        reimbursement=ReimbursementConfig(
            rate_per_kwh=0.12,
            belgium_cap_eur_per_kwh=0.15,
        ),
        reimbursement_monthly=ReimbursementSummary(
            month="2025-03",
            total_kwh=5.0,
            pending_amount=0.6,
            sessions_count=1,
        ),
        sessions_recent=[sess],
        api_partial=False,
    )
    coord.data = d
    return coord


def test_build_full_panel_payload_schema(mock_hass, mock_coordinator):
    payload = build_full_panel_payload(mock_hass, mock_coordinator)
    assert payload.get("schema_version") == 2
    assert "meta" in payload
    assert payload["meta"]["schema_version"] == 2
    assert payload["country_code"] == "BE"
    assert "sessions_enriched" in payload
    assert len(payload["sessions_enriched"]) >= 1
    row = payload["sessions_enriched"][0]
    assert row["user_id"] is None
    assert row["cost_estimate"] == pytest.approx(1.25, rel=1e-3)
    assert row["reimbursement_estimate"] == pytest.approx(0.6, rel=1e-3)
    assert "economics" in payload
    assert "diagnostics" in payload
    assert payload["economics"]["belgium_cap_compliant"] is True


def test_sessions_enriched_cost_api_and_tariffs_all(mock_hass):
    coord = MagicMock()
    entry = MagicMock()
    entry.entry_id = "e3"
    entry.unique_id = "u3"
    entry.options = {}
    entry.data = {"service_location_id": 1}
    coord.config_entry = entry
    coord.last_update_success = True
    sess = ChargingSession(
        id="cost-sess",
        charger_serial="C",
        connector=1,
        status="COMPLETED",
        energy_wh=8000,
        start=datetime.now(UTC),
        cost_amount=2.5,
        cost_currency="EUR",
        user_label="RFID User",
        card_label="Tag A",
    )
    coord.data = SmappeeCoordinatorData(
        installation=Installation(id=1, name="X"),
        tariffs=[
            TariffInfo(id="a", name="Night", price_per_kwh=0.1, currency="EUR"),
            TariffInfo(id="b", name="Day", price_per_kwh=0.3, currency="EUR"),
        ],
        sessions_recent=[sess],
    )
    payload = build_full_panel_payload(mock_hass, coord)
    row = next(r for r in payload["sessions_enriched"] if r["id"] == "cost-sess")
    assert row["cost_api_amount"] == 2.5
    assert row["cost_api_currency"] == "EUR"
    assert row["user_display"] == "RFID User"
    assert row["card_label"] == "Tag A"
    assert len(payload["economics"]["tariffs_all"]) == 2


def test_belgium_cap_non_compliant(mock_hass):
    coord = MagicMock()
    entry = MagicMock()
    entry.entry_id = "e2"
    entry.unique_id = "u2"
    entry.options = {"country_code": "BE"}
    entry.data = {"service_location_id": 1}
    coord.config_entry = entry
    coord.last_update_success = True
    sess = ChargingSession(
        id="x",
        charger_serial="C",
        connector=1,
        status="X",
        energy_wh=1000,
        start=datetime.now(UTC),
    )
    coord.data = SmappeeCoordinatorData(
        installation=Installation(id=1, name="X"),
        reimbursement=ReimbursementConfig(
            rate_per_kwh=0.20,
            belgium_cap_eur_per_kwh=0.10,
        ),
        sessions_recent=[sess],
    )
    payload = build_full_panel_payload(mock_hass, coord)
    assert payload["economics"]["belgium_cap_compliant"] is False


def test_overview_context_month_smart_savings(mock_hass, mock_coordinator):
    payload = build_full_panel_payload(mock_hass, mock_coordinator)
    oc = payload["overview_context"]
    assert oc["month_smart_savings"]["total_eur"] == pytest.approx(0.5, rel=1e-3)
    assert oc["month_smart_savings"]["sessions_count"] == 1
    assert oc["active_ev_hints"] == []


def test_overview_context_active_ev_hints(mock_hass):
    from ha_smappee_overview.models.features import ChargerFeatures

    coord = MagicMock()
    entry = MagicMock()
    entry.entry_id = "e4"
    entry.unique_id = "u4"
    entry.options = {}
    entry.data = {"service_location_id": 1}
    coord.config_entry = entry
    coord.last_update_success = True
    ch = EVCharger(
        serial="CH1",
        name="Wallbox",
        connectors=[
            ConnectorState(
                position=1, mode="PAUSED", current_a=16.0, session_active=True
            )
        ],
    )
    sess = ChargingSession(
        id="live1",
        charger_serial="CH1",
        connector=1,
        status="PAUSED",
        energy_wh=100,
        start=datetime.now(UTC),
    )
    coord.data = SmappeeCoordinatorData(
        installation=Installation(id=1, name="Home"),
        chargers=[ch],
        sessions_active=[sess],
        charger_features={
            "CH1": ChargerFeatures(serial="CH1", max_current_a=32.0),
        },
    )
    payload = build_full_panel_payload(mock_hass, coord)
    hints = payload["overview_context"]["active_ev_hints"]
    assert len(hints) == 1
    assert hints[0]["pause_explanation"]["code"] == "wallbox_paused"
    factors = {x["factor"] for x in hints[0]["limit_chain"]}
    assert "hardware_max" in factors
    assert "set_current" in factors
