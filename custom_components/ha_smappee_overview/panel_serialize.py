"""Panel WebSocket JSON serialization (testable without HA)."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from .const import DISCOVERY_STALE_POLL_MULTIPLIER
from .coordinator_data import SmappeeCoordinatorData
from .models import ChargingSession, ConsumptionSummary, EVCharger


def consumption_to_dict(c: ConsumptionSummary | None) -> dict[str, Any] | None:
    if c is None:
        return None
    return {
        "timestamp": c.timestamp.isoformat(),
        "stale": c.stale,
        "grid_import_w": c.grid_import_w,
        "grid_export_w": c.grid_export_w,
        "solar_w": c.solar_w,
        "consumption_w": c.consumption_w,
        "battery_flow_w": c.battery_flow_w,
        "always_on_w": c.always_on_w,
        "gas_m3": c.gas_m3,
        "water_m3": c.water_m3,
        "self_consumption_pct": c.self_consumption_pct,
        "self_sufficiency_pct": c.self_sufficiency_pct,
        "battery_soc_pct": c.battery_soc_pct,
        "phase_metrics": (
            {
                "l1_v": c.phase_metrics.l1_voltage,
                "l2_v": c.phase_metrics.l2_voltage,
                "l3_v": c.phase_metrics.l3_voltage,
                "l1_a": c.phase_metrics.l1_current,
                "l2_a": c.phase_metrics.l2_current,
                "l3_a": c.phase_metrics.l3_current,
                "l1_w": c.phase_metrics.l1_power_w,
                "l2_w": c.phase_metrics.l2_power_w,
                "l3_w": c.phase_metrics.l3_power_w,
            }
            if c.phase_metrics
            else None
        ),
        "submeters": [
            {
                "id": sm.id,
                "name": sm.name,
                "power_w": sm.power_w,
                "energy_wh": sm.energy_wh,
            }
            for sm in c.submeters
        ],
    }


def charger_to_dict(ch: EVCharger) -> dict[str, Any]:
    return {
        "serial": ch.serial,
        "name": ch.name,
        "availability": ch.availability,
        "connectors": [
            {
                "position": co.position,
                "mode": co.mode,
                "current_a": co.current_a,
                "session_active": co.session_active,
                "led_brightness_pct": co.led_brightness_pct,
            }
            for co in ch.connectors
        ],
    }


def session_to_dict(s: ChargingSession) -> dict[str, Any]:
    return {
        "id": s.id,
        "charger_serial": s.charger_serial,
        "connector": s.connector,
        "status": s.status,
        "energy_wh": s.energy_wh,
        "duration_s": s.duration_s,
        "start": s.start.isoformat() if s.start else None,
        "end": s.end.isoformat() if s.end else None,
        "solar_share_pct": s.solar_share_pct,
        "user_id": s.user_id,
        "user_label": s.user_label,
        "card_label": s.card_label,
        "cost_api_amount": s.cost_amount,
        "cost_api_currency": s.cost_currency,
        "tariff_id": s.tariff_id,
    }


def panel_data_dict(d: SmappeeCoordinatorData) -> dict[str, Any]:
    """Serialize coordinator data for the frontend panel."""
    return {
        "installation": (
            {"id": d.installation.id, "name": d.installation.name}
            if d.installation
            else None
        ),
        "installation_features": {
            "tariffs_available": d.installation_features.tariffs_available,
            "alerts_available": d.installation_features.alerts_available,
            "has_three_phase": d.installation_features.has_three_phase,
        },
        "charger_features": {
            serial: {
                "is_dc": f.is_dc,
                "supports_smart_mode": f.supports_smart_mode,
                "supports_current_limit": f.supports_current_limit,
                "supports_availability_patch": f.supports_availability_patch,
                "max_current_a": f.max_current_a,
            }
            for serial, f in d.charger_features.items()
        },
        "consumption": consumption_to_dict(d.consumption),
        "chargers": [charger_to_dict(c) for c in d.chargers],
        "sessions_active": [session_to_dict(s) for s in d.sessions_active],
        "sessions_recent": [session_to_dict(s) for s in d.sessions_recent],
        "tariffs": [
            {
                "id": t.id,
                "name": t.name,
                "currency": t.currency,
                "price_per_kwh": t.price_per_kwh,
            }
            for t in d.tariffs
        ],
        "alerts": [
            {"id": a.id, "message": a.message, "severity": a.severity}
            for a in d.alerts[:50]
        ],
        "reimbursement": (
            {
                "rate_per_kwh": d.reimbursement.rate_per_kwh,
                "currency": d.reimbursement.currency,
                "belgium_cap": d.reimbursement.belgium_cap_eur_per_kwh,
            }
            if d.reimbursement
            else None
        ),
        "reimbursement_monthly": (
            {
                "month": d.reimbursement_monthly.month,
                "total_kwh": d.reimbursement_monthly.total_kwh,
                "pending_amount": d.reimbursement_monthly.pending_amount,
                "sessions_count": d.reimbursement_monthly.sessions_count,
            }
            if d.reimbursement_monthly
            else None
        ),
        "last_successful_update": d.last_successful_update.isoformat()
        if d.last_successful_update
        else None,
        "last_error": d.last_error,
        "api_partial": d.api_partial,
        "backend_health": dict(d.backend_health),
        "validation_warnings": list(d.validation_warnings),
    }


def build_discovery_payload(
    d: SmappeeCoordinatorData,
    *,
    update_interval_s: int,
    coordinator_last_update_success: bool,
    consumption_stale: bool,
) -> dict[str, Any]:
    """Serialize discovery topology and per-node connectivity hints for the panel."""
    now = datetime.now(UTC)
    snap = d.discovery
    threshold_s = float(max(1, update_interval_s) * DISCOVERY_STALE_POLL_MULTIPLIER)
    nodes_out: list[dict[str, Any]] = []
    for n in snap.nodes:
        last_seen = d.discovery_last_observed.get(n.node_id, snap.generated_at or now)
        api_seen_iso = n.api_last_seen.isoformat() if n.api_last_seen else None
        if n.api_online is True:
            conn = "ok"
        elif n.api_online is False:
            conn = "offline"
        else:
            age_s = (now - last_seen).total_seconds()
            if age_s > threshold_s:
                conn = "stale"
            elif not coordinator_last_update_success:
                conn = "unknown"
            else:
                conn = "ok"
        nodes_out.append(
            {
                "id": n.node_id,
                "kind": n.kind,
                "label": n.label,
                "serial": n.serial,
                "parent_serial": n.parent_serial,
                "source_sl_devices": n.source_sl_devices,
                "source_charging_api": n.source_charging_api,
                "availability": n.availability,
                "connector_count": n.connector_count,
                "health": {
                    "connectivity": conn,
                    "last_seen_iso": last_seen.isoformat(),
                    "api_last_seen_iso": api_seen_iso,
                },
            }
        )
    summary = {"ok": 0, "offline": 0, "stale": 0, "unknown": 0}
    for item in nodes_out:
        key = item["health"]["connectivity"]
        if key in summary:
            summary[key] += 1
    return {
        "partial": snap.partial,
        "notes": list(snap.notes),
        "sources": dict(snap.sources),
        "generated_at": snap.generated_at.isoformat() if snap.generated_at else None,
        "edges": [{"parent": e.parent_id, "child": e.child_id} for e in snap.edges],
        "nodes": nodes_out,
        "summary": summary,
        "consumption_stale_hint": consumption_stale,
    }
