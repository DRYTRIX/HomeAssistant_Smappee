"""Feature flags per installation and charger (mutable, coordinator-owned)."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class InstallationFeatures:
    """Capabilities detected for the service location."""

    tariffs_available: bool = False
    alerts_available: bool = False
    has_three_phase: bool = False


@dataclass
class ChargerFeatures:
    """Capabilities per charging station."""

    serial: str
    is_dc: bool = False
    supports_smart_mode: bool = True
    supports_current_limit: bool = True
    supports_led_brightness: bool | None = None
    supports_availability_patch: bool | None = None
    max_current_a: float | None = None
    connector_count: int = 1
