"""API response parsing (pure functions)."""

from __future__ import annotations

from ha_smappee_overview.api.endpoints import (
    parse_alerts_payload,
    parse_charging_session,
    parse_consumption_summary,
    parse_installations,
    parse_phase_metrics,
    parse_tariffs_payload,
    phase_metrics_has_three_phase,
)


def test_parse_installations_list() -> None:
    raw = [
        {
            "serviceLocationId": 42,
            "name": "House",
            "uuid": "abc",
            "timezone": "Europe/Brussels",
        }
    ]
    locs = parse_installations(raw)
    assert len(locs) == 1
    assert locs[0].id == 42
    assert locs[0].name == "House"


def test_parse_installations_empty() -> None:
    assert parse_installations([]) == []


def test_parse_consumption_summary_grid_solar() -> None:
    raw = {
        "gridImport": 100,
        "gridExport": 0,
        "solar": 2500,
        "consumption": 1800,
        "selfConsumption": 75.5,
    }
    c = parse_consumption_summary(raw, stale=False)
    assert c.grid_import_w == 100.0
    assert c.solar_w == 2500.0
    assert c.self_consumption_pct == 75.5


def test_parse_consumption_summary_partial() -> None:
    c = parse_consumption_summary({}, stale=True)
    assert c.stale is True
    assert c.grid_import_w is None


def test_parse_charging_session_minimal() -> None:
    row = {
        "id": "sess-1",
        "connectorPosition": 1,
        "status": "CHARGING",
        "energyWh": 5000,
    }
    s = parse_charging_session(row, "SN123")
    assert s is not None
    assert s.id == "sess-1"
    assert s.energy_wh == 5000.0
    assert s.charger_serial == "SN123"


def test_parse_charging_session_missing_id() -> None:
    assert parse_charging_session({}, "") is None


def test_parse_phase_metrics_three_phase() -> None:
    raw = {"l1Voltage": 230.0, "l2Voltage": 231.0, "l3Voltage": 229.0}
    pm = parse_phase_metrics(raw)
    assert pm is not None
    assert pm.l2_voltage == 231.0
    assert phase_metrics_has_three_phase(pm) is True


def test_parse_phase_metrics_empty() -> None:
    assert parse_phase_metrics({}) is None
    assert phase_metrics_has_three_phase(None) is False


def test_parse_consumption_includes_battery_soc() -> None:
    c = parse_consumption_summary({"batterySoc": 88.5}, stale=False)
    assert c.battery_soc_pct == 88.5


def test_parse_tariffs_payload() -> None:
    rows = [{"id": "t1", "name": "Peak", "pricePerKwh": 0.35, "currency": "EUR"}]
    t = parse_tariffs_payload(rows)
    assert len(t) == 1
    assert t[0].id == "t1"
    assert t[0].price_per_kwh == 0.35


def test_parse_tariffs_dict_wrapper() -> None:
    t = parse_tariffs_payload({"tariffs": [{"id": "x", "name": "Night", "pricePerKwh": 0.09}]})
    assert len(t) == 1
    assert t[0].name == "Night"


def test_parse_alerts_payload() -> None:
    a = parse_alerts_payload([{"id": "1", "message": "Offline", "severity": "warn"}])
    assert len(a) == 1
    assert a[0].severity == "warn"


def test_parse_alerts_requires_message() -> None:
    assert parse_alerts_payload([{"id": "1"}]) == []


def test_parse_charging_session_cost_and_labels() -> None:
    row = {
        "id": "s-cost",
        "connectorPosition": 1,
        "status": "COMPLETED",
        "totalCost": 4.25,
        "currency": "eur",
        "tariffId": "peak-1",
        "userName": "Driver A",
        "cardName": "Tag 12",
    }
    s = parse_charging_session(row, "SN")
    assert s is not None
    assert s.cost_amount == 4.25
    assert s.cost_currency == "EUR"
    assert s.tariff_id == "peak-1"
    assert s.user_label == "Driver A"
    assert s.card_label == "Tag 12"


def test_parse_charging_session_alt_cost_keys() -> None:
    s = parse_charging_session(
        {"id": "x", "cost": 1.5, "priceCurrency": "USD"}, ""
    )
    assert s is not None
    assert s.cost_amount == 1.5
    assert s.cost_currency == "USD"
