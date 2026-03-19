"""Energy intelligence aggregates (pure)."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.energy_intelligence import (
    EnergyIntelligenceOptions,
    compute_energy_intelligence,
    session_is_smart_or_solar,
)
from ha_smappee_overview.models import (
    ChargingSession,
    ConnectorState,
    EVCharger,
    ReimbursementConfig,
    TariffInfo,
)


def _dt(y: int, m: int, d: int, h: int = 12) -> datetime:
    return datetime(y, m, d, h, 0, 0, tzinfo=UTC)


def test_tariff_id_match_uses_second_tariff() -> None:
    now = _dt(2025, 3, 15)
    tariffs = [
        TariffInfo(id="A", price_per_kwh=0.30, currency="EUR"),
        TariffInfo(id="B", price_per_kwh=0.50, currency="EUR"),
    ]
    s = ChargingSession(
        id="1",
        charger_serial="x",
        connector=1,
        status="COMPLETED",
        energy_wh=10000,
        start=_dt(2025, 3, 10),
        tariff_id="B",
    )
    out = compute_energy_intelligence([s], tariffs, None, [], now_utc=now)
    assert out["costs"]["month"]["cost"] == 5.0  # 10 kWh * 0.5


def test_cost_prefers_api_amount() -> None:
    now = _dt(2025, 3, 15)
    tariffs = [TariffInfo(id="A", price_per_kwh=0.30, currency="EUR")]
    s = ChargingSession(
        id="1",
        charger_serial="x",
        connector=1,
        status="COMPLETED",
        energy_wh=10000,
        start=_dt(2025, 3, 5),
        cost_amount=2.5,
    )
    out = compute_energy_intelligence([s], tariffs, None, [], now_utc=now)
    assert out["costs"]["month"]["cost"] == 2.5


def test_solar_weighted_and_split() -> None:
    now = _dt(2025, 3, 20)
    tariffs = [TariffInfo(price_per_kwh=0.40, currency="EUR")]
    sessions = [
        ChargingSession(
            id="a",
            charger_serial="x",
            connector=1,
            status="COMPLETED",
            energy_wh=5000,
            start=_dt(2025, 3, 8),
            solar_share_pct=100.0,
        ),
        ChargingSession(
            id="b",
            charger_serial="x",
            connector=1,
            status="COMPLETED",
            energy_wh=5000,
            start=_dt(2025, 3, 9),
            solar_share_pct=0.0,
        ),
    ]
    out = compute_energy_intelligence(sessions, tariffs, None, [], now_utc=now)
    se = out["solar_ev"]
    assert se["weighted_solar_pct"] == 50.0
    assert se["solar_kwh"] == 5.0
    assert se["grid_kwh"] == 5.0


def test_unknown_solar_kwh_bucket() -> None:
    now = _dt(2025, 3, 10)
    tariffs = [TariffInfo(price_per_kwh=0.30, currency="EUR")]
    s = ChargingSession(
        id="1",
        charger_serial="x",
        connector=1,
        status="COMPLETED",
        energy_wh=3000,
        start=_dt(2025, 3, 2),
        solar_share_pct=None,
    )
    out = compute_energy_intelligence([s], tariffs, None, [], now_utc=now)
    assert out["solar_ev"]["unknown_solar_kwh"] == 3.0


def test_smart_counterfactual_savings() -> None:
    now = _dt(2025, 3, 12)
    tariffs = [TariffInfo(price_per_kwh=0.40, currency="EUR")]
    s = ChargingSession(
        id="1",
        charger_serial="x",
        connector=1,
        status="CHARGING",
        energy_wh=10000,
        start=_dt(2025, 3, 11),
        raw={"mode": "SMART"},
        cost_amount=3.0,
    )
    assert session_is_smart_or_solar(s) is True
    out = compute_energy_intelligence([s], tariffs, None, [], now_utc=now)
    sc = out["smart_charging"]
    assert sc["counterfactual_flat_grid_eur"] == 4.0
    assert sc["actual_cost_preferred_eur"] == 3.0
    assert sc["savings_eur"] == 1.0


def test_reimbursement_buckets() -> None:
    now = _dt(2025, 3, 18)
    tariffs: list[TariffInfo] = []
    reim = ReimbursementConfig(rate_per_kwh=0.25, currency="EUR")
    sessions = [
        ChargingSession(
            id="c",
            charger_serial="x",
            connector=1,
            status="COMPLETED",
            energy_wh=4000,
            start=_dt(2025, 3, 10),
        ),
        ChargingSession(
            id="p",
            charger_serial="x",
            connector=1,
            status="CHARGING",
            energy_wh=2000,
            start=_dt(2025, 3, 17),
        ),
    ]
    out = compute_energy_intelligence(sessions, tariffs, reim, [], now_utc=now)
    r = out["reimbursement"]
    assert r["completed"]["kwh"] == 4.0
    assert r["completed"]["amount"] == 1.0
    assert r["in_progress"]["kwh"] == 2.0
    assert r["in_progress"]["amount"] == 0.5


def test_belgium_cap_on_reimbursement() -> None:
    now = _dt(2025, 3, 5)
    reim = ReimbursementConfig(
        rate_per_kwh=0.50,
        currency="EUR",
        belgium_cap_eur_per_kwh=0.20,
    )
    s = ChargingSession(
        id="1",
        charger_serial="x",
        connector=1,
        status="COMPLETED",
        energy_wh=1000,
        start=_dt(2025, 3, 4),
    )
    out = compute_energy_intelligence([s], [], reim, [], now_utc=now)
    assert out["reimbursement"]["completed"]["amount"] == 0.2


def test_dedupe_session_ids() -> None:
    now = _dt(2025, 3, 6)
    tariffs = [TariffInfo(price_per_kwh=0.10, currency="EUR")]
    s = ChargingSession(
        id="dup",
        charger_serial="x",
        connector=1,
        status="COMPLETED",
        energy_wh=5000,
        start=_dt(2025, 3, 5),
    )
    out = compute_energy_intelligence([s, s], tariffs, None, [], now_utc=now)
    assert out["costs"]["month"]["kwh"] == 5.0


def test_realtime_power_from_chargers() -> None:
    now = _dt(2025, 3, 1)
    tariffs = [TariffInfo(price_per_kwh=1.0, currency="EUR")]
    ch = EVCharger(
        serial="s",
        name="Wall",
        connectors=[
            ConnectorState(
                position=1,
                mode="NORMAL",
                current_a=16.0,
                session_active=True,
            )
        ],
    )
    opt = EnergyIntelligenceOptions(line_voltage=230.0, charge_phases=1)
    out = compute_energy_intelligence([], tariffs, None, [ch], now_utc=now, options=opt)
    assert out["costs"]["realtime_power_estimate_w"] == 16 * 230
    assert out["costs"]["realtime_estimate_eur_per_h"] == round(16 * 230 / 1000 * 1.0, 4)


def test_capacity_utilization() -> None:
    now = _dt(2025, 3, 1)
    opt = EnergyIntelligenceOptions(
        country_code="BE",
        enable_capacity_tracking=True,
        capacity_contract_kw=10.0,
        capacity_warn_pct=80.0,
        capacity_eur_per_kw_year=50.0,
    )
    out = compute_energy_intelligence(
        [],
        [],
        None,
        [],
        now_utc=now,
        peak_kw_sampled=8.5,
        peak_sample_count=100,
        peak_method="monthly_max_of_ha_states",
        options=opt,
    )
    cb = out["capacity_be"]
    assert cb["utilization_pct"] == 85.0
    assert cb["warning_level"] == "warn"
    assert cb["annual_impact_estimate_eur"] == 425.0
