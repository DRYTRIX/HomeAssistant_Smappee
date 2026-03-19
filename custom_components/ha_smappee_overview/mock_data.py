"""Deterministic backend mock payloads for UI/debugging."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from .models import (
    ChargingSession,
    ConnectorState,
    ConsumptionSummary,
    EVCharger,
    Installation,
    ReimbursementConfig,
    TariffInfo,
)


def build_mock_installation(service_location_id: int) -> Installation:
    return Installation(
        id=service_location_id,
        name=f"Mock Location {service_location_id}",
        timezone="UTC",
        raw={"mock": True},
    )


def build_mock_consumption(now_utc: datetime) -> ConsumptionSummary:
    return ConsumptionSummary(
        timestamp=now_utc,
        stale=False,
        grid_import_w=850.0,
        grid_export_w=120.0,
        solar_w=2100.0,
        consumption_w=1830.0,
        always_on_w=220.0,
        raw={"mock": True},
    )


def build_mock_chargers(now_utc: datetime) -> list[EVCharger]:
    return [
        EVCharger(
            serial="MOCK-CH-001",
            name="Mock Charger",
            availability=True,
            last_sync=now_utc,
            connectors=[
                ConnectorState(
                    position=1,
                    mode="SMART",
                    current_a=10.0,
                    session_active=True,
                    led_brightness_pct=60,
                    raw={"mock": True},
                )
            ],
            raw={"mock": True},
        )
    ]


def build_mock_sessions(now_utc: datetime) -> tuple[list[ChargingSession], list[ChargingSession]]:
    active = [
        ChargingSession(
            id="mock-active-1",
            charger_serial="MOCK-CH-001",
            connector=1,
            status="CHARGING",
            energy_wh=4200.0,
            duration_s=1800,
            start=now_utc - timedelta(minutes=30),
            user_id="mock-user",
            user_label="Mock User",
            raw={"mock": True},
        )
    ]
    recent = [
        ChargingSession(
            id="mock-recent-1",
            charger_serial="MOCK-CH-001",
            connector=1,
            status="COMPLETED",
            energy_wh=12500.0,
            duration_s=4200,
            start=now_utc - timedelta(hours=5),
            end=now_utc - timedelta(hours=4, minutes=10),
            user_id="mock-user",
            user_label="Mock User",
            raw={"mock": True},
        )
    ]
    return active, recent


def build_mock_tariffs() -> list[TariffInfo]:
    return [
        TariffInfo(
            id="mock-tariff",
            name="Mock Day Tariff",
            currency="EUR",
            price_per_kwh=0.29,
            raw={"mock": True},
        )
    ]


def build_mock_reimbursement() -> ReimbursementConfig:
    return ReimbursementConfig(
        rate_per_kwh=0.20,
        currency="EUR",
        belgium_cap_eur_per_kwh=0.25,
        history=[],
    )
