"""Diagnostics export."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_ACCESS_TOKEN,
    CONF_CLIENT_SECRET,
    CONF_REFRESH_TOKEN,
    DATA_COORDINATOR,
    DOMAIN,
)
from .coordinator import SmappeeOverviewCoordinator
from .models import ChargerFeatures


def _charger_features_for_diagnostics(
    features: dict[str, ChargerFeatures], *, limit: int = 12
) -> dict[str, dict[str, Any]]:
    """Serializable per-charger capability map (no raw API blobs)."""
    out: dict[str, dict[str, Any]] = {}
    for serial, cf in list(features.items())[:limit]:
        out[serial] = {
            "is_dc": cf.is_dc,
            "supports_smart_mode": cf.supports_smart_mode,
            "supports_current_limit": cf.supports_current_limit,
            "supports_led_brightness": cf.supports_led_brightness,
            "supports_availability_patch": cf.supports_availability_patch,
            "max_current_a": cf.max_current_a,
            "connector_count": cf.connector_count,
        }
    return out


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    info: dict[str, Any] = {
        "title": entry.title,
        "unique_id": entry.unique_id,
        "service_location_id": entry.data.get("service_location_id"),
    }
    token = entry.data.get(CONF_ACCESS_TOKEN, "")
    if isinstance(token, str) and len(token) > 8:
        info["access_token_suffix"] = token[-4:]
    rt = entry.data.get(CONF_REFRESH_TOKEN, "")
    if isinstance(rt, str) and len(rt) > 4:
        info["refresh_token_configured"] = True
    secret = entry.data.get(CONF_CLIENT_SECRET, "")
    if secret:
        info["client_secret_configured"] = True

    domain_data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if domain_data:
        coord: SmappeeOverviewCoordinator | None = domain_data.get(
            DATA_COORDINATOR
        )
        if coord:
            d = coord.data
            info["coordinator_last_update_success"] = getattr(
                coord, "last_update_success", None
            )
            info["last_exception"] = (
                repr(coord.last_exception) if coord.last_exception else None
            )
            lu = d.last_successful_update
            info["last_successful_update"] = lu.isoformat() if lu else None
            info["panel_data_keys"] = list(coord.panel_data_dict().keys())
            info["api_partial"] = d.api_partial
            info["last_error"] = d.last_error
            info["consumption_stale"] = (
                bool(d.consumption.stale) if d.consumption else None
            )
            info["charger_count"] = len(d.chargers)
            inst = d.installation_features
            info["installation_features"] = {
                "tariffs_available": inst.tariffs_available,
                "alerts_available": inst.alerts_available,
                "has_three_phase": inst.has_three_phase,
            }
            info["charger_features"] = _charger_features_for_diagnostics(
                d.charger_features
            )
            info["tariff_count"] = len(d.tariffs)
            info["alert_count"] = len(d.alerts)
            info["sessions_active_count"] = len(d.sessions_active)
            info["sessions_recent_count"] = len(d.sessions_recent)
            info["api_health_summary"] = {
                "has_installation": d.installation is not None,
                "has_consumption_object": d.consumption is not None,
                "consumption_stale": bool(d.consumption.stale)
                if d.consumption
                else None,
                "partial_failure_reported": d.api_partial,
            }
            if d.consumption and d.consumption.raw:
                info["consumption_raw_keys"] = list(d.consumption.raw.keys())[:40]
            for i, ch in enumerate(d.chargers[:5]):
                info[f"charger_{i}_serial"] = ch.serial
                info[f"charger_{i}_raw_keys"] = list(ch.raw.keys())[:25]
    return info
