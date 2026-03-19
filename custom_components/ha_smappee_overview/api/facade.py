"""Domain-oriented API over SmappeeAPIClient (stable names for coordinator/UI)."""

from __future__ import annotations

from typing import Any

from ..models import (
    AlertItem,
    ChargingSession,
    ConsumptionSummary,
    EVCharger,
    Installation,
    TariffInfo,
)
from .client import SmappeeAPIClient


class SmappeeDomainAPI:
    """Facades REST calls; transport stays in SmappeeAPIClient."""

    __slots__ = ("_client",)

    def __init__(self, client: SmappeeAPIClient) -> None:
        self._client = client

    @property
    def client(self) -> SmappeeAPIClient:
        """Underlying client for services that need direct access."""
        return self._client

    async def list_service_locations(self) -> list[Installation]:
        return await self._client.get_servicelocations()

    async def get_service_location_detail(
        self, service_location_id: int
    ) -> dict[str, Any] | None:
        return await self._client.get_servicelocation_detail(service_location_id)

    async def get_energy_snapshot(self, service_location_id: int) -> ConsumptionSummary:
        return await self._client.get_realtime_consumption(service_location_id)

    async def list_charging_stations(self, service_location_id: int) -> list[EVCharger]:
        return await self._client.list_charging_stations(service_location_id)

    async def list_tariffs(self, service_location_id: int) -> tuple[list[TariffInfo], bool]:
        return await self._client.get_tariffs(service_location_id)

    async def list_alerts(self, service_location_id: int) -> tuple[list[AlertItem], bool]:
        return await self._client.get_alerts(service_location_id)

    async def list_charging_sessions(
        self,
        station_serial: str,
        from_ms: int,
        to_ms: int,
        *,
        service_location_id: int | None = None,
        charging_park_id: int | None = None,
    ) -> list[ChargingSession]:
        return await self._client.get_charging_sessions(
            station_serial,
            from_ms,
            to_ms,
            service_location_id=service_location_id,
            charging_park_id=charging_park_id,
        )

    async def set_connector_charging_mode(
        self,
        station_serial: str,
        connector_position: int,
        mode: str,
        *,
        limit_percent: int | None = None,
        current_a: float | None = None,
    ) -> None:
        await self._client.set_connector_mode(
            station_serial,
            connector_position,
            mode,
            limit_percent=limit_percent,
            current_a=current_a,
        )

    async def set_station_led_brightness(self, station_serial: str, brightness_pct: int) -> None:
        await self._client.set_led_brightness(station_serial, brightness_pct)

    async def set_station_availability(self, station_serial: str, available: bool) -> bool:
        return await self._client.set_charger_availability(station_serial, available)
