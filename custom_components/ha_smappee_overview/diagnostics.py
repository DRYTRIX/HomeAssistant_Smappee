"""Diagnostics export."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_ACCESS_TOKEN,
    CONF_CLIENT_SECRET,
    CONF_REFRESH_TOKEN,
    DOMAIN,
)
from .coordinator import SmappeeOverviewCoordinator


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
        coord: SmappeeOverviewCoordinator | None = domain_data.get("coordinator")
        if coord:
            d = coord.data
            info["last_update_success"] = (
                coord.last_update_success if hasattr(coord, "last_update_success") else None
            )
            info["last_exception"] = repr(coord.last_exception) if coord.last_exception else None
            info["panel_data_keys"] = list(coord.panel_data_dict().keys())
            info["api_partial"] = d.api_partial
            info["last_error"] = d.last_error
            info["charger_count"] = len(d.chargers)
            info["installation_features"] = {
                "tariffs_available": d.installation_features.tariffs_available,
                "alerts_available": d.installation_features.alerts_available,
                "has_three_phase": d.installation_features.has_three_phase,
            }
            info["tariff_count"] = len(d.tariffs)
            info["alert_count"] = len(d.alerts)
            if d.consumption and d.consumption.raw:
                info["consumption_raw_keys"] = list(d.consumption.raw.keys())[:40]
            for i, ch in enumerate(d.chargers[:5]):
                info[f"charger_{i}_serial"] = ch.serial
                info[f"charger_{i}_raw_keys"] = list(ch.raw.keys())[:25]
    return info
