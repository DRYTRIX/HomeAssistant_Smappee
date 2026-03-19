"""Full panel WebSocket payload including schema v2 extras."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .api.endpoints import phase_metrics_has_three_phase
from .assistant_heuristics import build_assistant_suggestions
from .charging_explanation import (
    build_connector_explanations,
    build_limit_chain,
    explanation_for_hint,
    pause_explanation,
)
from .const import (
    CONF_ADVANCED_PANEL,
    CONF_ASSISTANT_ASSUMED_SESSION_KWH,
    CONF_ASSISTANT_OFF_PEAK_PRICE_PER_KWH,
    CONF_COUNTRY_CODE,
    CONF_DEBUG_SESSION_JSON_KEYS,
    CONF_PEAK_PHASE_CURRENT_WARNING_A,
    CONF_UPDATE_INTERVAL,
    DEFAULT_ASSISTANT_ASSUMED_SESSION_KWH,
    DEFAULT_UPDATE_INTERVAL,
)
from .coordinator import SmappeeOverviewCoordinator
from .energy_intelligence import (
    compute_energy_intelligence,
    energy_intelligence_options_from_mapping,
)
from .coordinator_data import SmappeeCoordinatorData
from .models import ChargingSession, EVCharger, ReimbursementConfig, TariffInfo
from .panel_entity_map import build_entity_map
from .panel_serialize import build_discovery_payload, panel_data_dict, session_to_dict


def _effective_mode_from_session(s: ChargingSession) -> str | None:
    st = (s.status or "").upper()
    if st in ("CHARGING", "STARTED"):
        return "charging"
    if "PAUSE" in st or st == "PAUSED":
        return "paused"
    if st in ("COMPLETED", "STOPPED", "ENDED"):
        return "ended"
    raw_mode = s.raw.get("mode") or s.raw.get("chargingMode")
    if raw_mode:
        return str(raw_mode).lower()
    return None


def _enrich_session(
    s: ChargingSession,
    tariff_per_kwh: float | None,
    reim_rate: float | None,
    belgium_cap: float | None,
) -> dict[str, Any]:
    base = session_to_dict(s)
    base["user_id"] = s.user_id
    base["user_label"] = s.user_label
    base["card_label"] = s.card_label
    base["user_display"] = s.user_label or s.user_id
    base["cost_api_amount"] = s.cost_amount
    base["cost_api_currency"] = s.cost_currency
    base["tariff_id"] = s.tariff_id
    base["effective_mode"] = _effective_mode_from_session(s)
    kwh = (s.energy_wh or 0) / 1000.0 if s.energy_wh else None
    base["cost_estimate"] = None
    base["reimbursement_estimate"] = None
    base["solar_savings_estimate"] = None
    if kwh is not None and kwh > 0:
        if tariff_per_kwh is not None:
            base["cost_estimate"] = round(kwh * tariff_per_kwh, 4)
        rate = reim_rate
        if rate is not None and belgium_cap is not None:
            rate = min(rate, belgium_cap)
        if rate is not None:
            base["reimbursement_estimate"] = round(kwh * rate, 4)
        if tariff_per_kwh is not None and s.solar_share_pct is not None:
            base["solar_savings_estimate"] = round(
                kwh * tariff_per_kwh * (s.solar_share_pct / 100.0), 4
            )
    return base


def _primary_tariff(tariffs: list[TariffInfo]) -> float | None:
    if not tariffs:
        return None
    t0 = tariffs[0]
    return float(t0.price_per_kwh) if t0.price_per_kwh is not None else None


def _tariff_primary_dict(tariffs: list[TariffInfo]) -> dict[str, Any] | None:
    if not tariffs:
        return None
    t = tariffs[0]
    return {
        "id": t.id,
        "name": t.name,
        "currency": t.currency,
        "price_per_kwh": t.price_per_kwh,
    }


def _today_bounds_utc() -> tuple[datetime, datetime]:
    now = datetime.now(UTC)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start, now


def _session_in_range(
    s: ChargingSession, start: datetime, end: datetime
) -> bool:
    if s.start is None:
        return False
    t = s.start
    if t.tzinfo is None:
        t = t.replace(tzinfo=UTC)
    return start <= t <= end


def _compute_today_economics(
    sessions: list[ChargingSession],
    reim_rate: float | None,
    belgium_cap: float | None,
) -> tuple[float, float]:
    start, end = _today_bounds_utc()
    total_kwh = 0.0
    for s in sessions:
        if not _session_in_range(s, start, end):
            continue
        if s.energy_wh:
            total_kwh += s.energy_wh / 1000.0
    rate = reim_rate
    if rate is not None and belgium_cap is not None:
        rate = min(rate, belgium_cap)
    pending = total_kwh * rate if rate is not None else 0.0
    return round(total_kwh, 4), round(pending, 2)


def _compute_today_charging_cost_estimate(
    sessions: list[ChargingSession],
    tariff_per_kwh: float | None,
) -> float | None:
    """Sum primary-tariff cost estimate for sessions that started today (UTC)."""
    if tariff_per_kwh is None:
        return None
    start, end = _today_bounds_utc()
    total = 0.0
    any_energy = False
    for s in sessions:
        if not _session_in_range(s, start, end):
            continue
        if not s.energy_wh:
            continue
        kwh = s.energy_wh / 1000.0
        if kwh <= 0:
            continue
        any_energy = True
        total += kwh * tariff_per_kwh
    return round(total, 4) if any_energy else None


def _estimate_ev_power_w(
    chargers: list[EVCharger],
    consumption,
) -> float | None:
    """Rough AC power from active connector currents and phase voltages (estimated)."""
    pm = consumption.phase_metrics if consumption else None
    v_vals: list[float] = []
    if pm:
        for x in (pm.l1_voltage, pm.l2_voltage, pm.l3_voltage):
            if x is not None and x > 0:
                v_vals.append(float(x))
    v_phase = sum(v_vals) / len(v_vals) if v_vals else 230.0
    three = phase_metrics_has_three_phase(pm)
    total = 0.0
    any_cur = False
    for ch in chargers:
        for co in ch.connectors:
            if not co.session_active:
                continue
            cur = co.current_a
            if cur is None or cur <= 0:
                continue
            any_cur = True
            if three:
                total += 3.0 * v_phase * float(cur)
            else:
                total += v_phase * float(cur)
    return round(total, 0) if any_cur else None


def _build_operational_flags(
    d: SmappeeCoordinatorData,
    active_hints: list[dict[str, Any]],
) -> dict[str, Any]:
    """High-level UI flags (all best-effort)."""
    charging_active = False
    for s in d.sessions_active:
        st = (s.status or "").upper()
        if st in ("CHARGING", "STARTED") or "CHARGING" in st:
            charging_active = True
            break
    if not charging_active:
        for ch in d.chargers:
            for co in ch.connectors:
                if co.session_active and (co.current_a or 0) > 0:
                    charging_active = True
                    break
            if charging_active:
                break

    smart_mode_any = any(
        co.mode == "SMART" for ch in d.chargers for co in ch.connectors
    )
    solar_mode_any = False
    for ch in d.chargers:
        for co in ch.connectors:
            raw = co.raw or {}
            raw_m = str(
                raw.get("mode") or raw.get("chargingMode") or ""
            ).upper()
            if "SOLAR" in raw_m:
                solar_mode_any = True
                break
        if solar_mode_any:
            break

    overload_suspected = False
    for ch in d.chargers:
        lb = _charger_load_balance(ch)
        if lb and lb.get("reported"):
            raw_v = lb.get("value")
            if isinstance(raw_v, dict):
                keys = " ".join(str(k).lower() for k in raw_v)
                if "overload" in keys:
                    overload_suspected = True
                    break
    if not overload_suspected:
        for h in active_hints:
            for step in h.get("limit_chain") or []:
                if step.get("factor") == "load_balance":
                    overload_suspected = True
                    break
            if overload_suspected:
                break

    solar_surplus = False
    c = d.consumption
    if c and c.grid_export_w is not None and c.grid_export_w > 400:
        solar_surplus = True

    return {
        "charging_active": charging_active,
        "smart_mode_any": smart_mode_any,
        "solar_mode_any": solar_mode_any,
        "overload_suspected": overload_suspected,
        "solar_surplus": solar_surplus,
    }


def _raw_excerpt(raw: dict[str, Any], max_keys: int = 30) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for i, (k, v) in enumerate(raw.items()):
        if i >= max_keys:
            out["_truncated"] = True
            break
        if isinstance(v, (dict, list)) and len(str(v)) > 200:
            out[str(k)] = f"<{type(v).__name__} len={len(v)}>"
        else:
            out[str(k)] = v
    return out


def _compute_month_smart_savings_eur(
    sessions: list[ChargingSession],
    tariff_per_kwh: float | None,
    month_yyyy_mm: str,
    currency: str,
) -> dict[str, Any]:
    """Sum estimated solar-based tariff savings for sessions in calendar month (UTC)."""
    if tariff_per_kwh is None:
        return {
            "total_eur": 0.0,
            "sessions_count": 0,
            "currency": currency,
        }
    total = 0.0
    count = 0
    for s in sessions:
        if s.start is None or s.start.strftime("%Y-%m") != month_yyyy_mm:
            continue
        kwh = (s.energy_wh or 0) / 1000.0
        if kwh <= 0 or s.solar_share_pct is None:
            continue
        total += kwh * tariff_per_kwh * (s.solar_share_pct / 100.0)
        count += 1
    return {
        "total_eur": round(total, 4),
        "sessions_count": count,
        "currency": currency,
    }


def _find_connector(
    chargers: list[EVCharger], serial: str, position: int
):
    for ch in chargers:
        if ch.serial != serial:
            continue
        for co in ch.connectors:
            if co.position == position:
                return ch, co
    return None, None


def _sessions_for_ev_hints(
    sessions_active: list[ChargingSession],
    sessions_recent: list[ChargingSession],
    chargers: list[EVCharger],
) -> list[ChargingSession]:
    """Sessions to drive pause/limit hints: active list plus recent open sessions on busy connectors."""
    seen: set[tuple[str, int]] = set()
    out: list[ChargingSession] = []
    for s in sessions_active:
        key = (s.charger_serial, s.connector)
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    covered = {(s.charger_serial, s.connector) for s in out}
    for ch in chargers:
        for co in ch.connectors:
            if not co.session_active:
                continue
            key = (ch.serial, co.position)
            if key in covered:
                continue
            candidates = [
                x
                for x in sessions_recent
                if x.charger_serial == ch.serial and x.connector == co.position
            ]
            candidates.sort(
                key=lambda x: x.start or datetime.min.replace(tzinfo=UTC),
                reverse=True,
            )
            for s in candidates:
                st = (s.status or "").upper()
                if st in ("COMPLETED", "STOPPED", "ENDED"):
                    continue
                out.append(s)
                covered.add(key)
                break
    return out


def _build_active_ev_hints(
    consumption: Any,
    hint_sessions: list[ChargingSession],
    chargers: list[EVCharger],
    charger_features: dict[str, Any],
    chargers_lb: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    lb_by_serial = {x["serial"]: x.get("load_balance", {}) for x in chargers_lb}
    hints: list[dict[str, Any]] = []
    seen: set[tuple[str, int]] = set()
    for s in hint_sessions:
        key = (s.charger_serial, s.connector)
        if key in seen:
            continue
        seen.add(key)
        _ch, co = _find_connector(chargers, s.charger_serial, s.connector)
        mode = co.mode if co else "UNKNOWN"
        feat = charger_features.get(s.charger_serial)
        max_a = float(feat.max_current_a) if feat and feat.max_current_a else None
        cur_a = float(co.current_a) if co and co.current_a is not None else None
        lb_raw = lb_by_serial.get(s.charger_serial, {}).get("value")
        hints.append(
            {
                "session_id": s.id,
                "charger_serial": s.charger_serial,
                "connector": s.connector,
                "status": s.status,
                "connector_mode": mode,
                "pause_explanation": pause_explanation(s.status or "", mode),
                "limit_chain": build_limit_chain(cur_a, max_a, mode, lb_raw),
                "explanation": explanation_for_hint(
                    consumption,
                    chargers,
                    charger_features,
                    chargers_lb,
                    s,
                ),
            }
        )
    return hints


_MAX_ADV_SESSION_RAW = 20
_ADV_RAW_KEYS_SESSION = 20
_ADV_RAW_KEYS_CHARGER = 20
_ADV_RAW_KEYS_CONSUMPTION = 30


def _build_advanced_payload(
    coordinator: SmappeeOverviewCoordinator,
    d: SmappeeCoordinatorData,
    update_s: int,
) -> dict[str, Any]:
    """Heavy debug payload; only attached when integration option + WS flag allow."""
    exc = getattr(coordinator, "last_exception", None)
    last_exc = repr(exc) if exc else None
    handling = getattr(coordinator, "handling_update", None)

    key_union: set[str] = set()
    for s in d.sessions_active + d.sessions_recent:
        key_union.update(str(k) for k in s.raw)

    seen_ids: set[str] = set()
    session_rows: list[dict[str, Any]] = []
    for s in d.sessions_active + d.sessions_recent:
        if s.id in seen_ids:
            continue
        seen_ids.add(s.id)
        session_rows.append(
            {
                "id": s.id,
                "charger_serial": s.charger_serial,
                "connector": s.connector,
                "excerpt": _raw_excerpt(s.raw, _ADV_RAW_KEYS_SESSION),
            }
        )
        if len(session_rows) >= _MAX_ADV_SESSION_RAW:
            break

    charger_rows = [
        {
            "serial": c.serial,
            "excerpt": _raw_excerpt(c.raw or {}, _ADV_RAW_KEYS_CHARGER),
        }
        for c in d.chargers
    ]

    cons_excerpt: dict[str, Any] = {}
    if d.consumption and d.consumption.raw:
        cons_excerpt = _raw_excerpt(d.consumption.raw, _ADV_RAW_KEYS_CONSUMPTION)

    return {
        "coordinator_state": {
            "config_entry_id": coordinator.config_entry.entry_id,
            "last_update_success": getattr(
                coordinator, "last_update_success", True
            ),
            "last_exception": last_exc,
            "handling_update": handling,
            "last_successful_update": d.last_successful_update.isoformat()
            if d.last_successful_update
            else None,
            "update_interval_s": update_s,
        },
        "raw_excerpts": {
            "sessions": session_rows,
            "chargers": charger_rows,
            "consumption": cons_excerpt,
        },
        "session_json_keys_union": sorted(key_union),
    }


def _charger_load_balance(ch) -> dict[str, Any] | None:
    raw = ch.raw or {}
    keys_lower = {str(k).lower(): k for k in raw}
    for candidate in (
        "loadbalancing",
        "load_balancing",
        "overload",
        "maxcurrent",
        "availablecurrent",
    ):
        for lk, orig in keys_lower.items():
            if candidate in lk.replace("_", ""):
                return {
                    "source_key": orig,
                    "value": raw.get(orig),
                    "reported": True,
                }
    return {"reported": False, "value": None}


def build_full_panel_payload(
    hass: HomeAssistant,
    coordinator: SmappeeOverviewCoordinator,
    *,
    intelligence_peak_sample: dict[str, Any] | None = None,
    include_advanced_requested: bool = False,
) -> dict[str, Any]:
    """Merge v1 panel dict with schema v2 fields."""
    d = coordinator.data
    entry: ConfigEntry = coordinator.config_entry
    base = panel_data_dict(d)
    opt = entry.options
    country = str(opt.get(CONF_COUNTRY_CODE) or "").strip().upper() or None
    if country == "":
        country = None

    tariff_f = _primary_tariff(d.tariffs)
    reim: ReimbursementConfig | None = d.reimbursement
    reim_rate = float(reim.rate_per_kwh) if reim else None
    cap = float(reim.belgium_cap_eur_per_kwh) if reim and reim.belgium_cap_eur_per_kwh is not None else None

    seen: set[str] = set()
    sessions_enriched: list[dict[str, Any]] = []
    for s in d.sessions_active + d.sessions_recent:
        if s.id in seen:
            continue
        seen.add(s.id)
        sessions_enriched.append(_enrich_session(s, tariff_f, reim_rate, cap))

    today_kwh, today_pending = _compute_today_economics(
        d.sessions_active + d.sessions_recent,
        reim_rate,
        cap,
    )
    today_charging_cost_estimate_eur = _compute_today_charging_cost_estimate(
        list(d.sessions_active) + list(d.sessions_recent),
        tariff_f,
    )
    estimated_ev_power_w = _estimate_ev_power_w(list(d.chargers), d.consumption)

    belgium_cap_compliant: bool | None = None
    if country == "BE" and reim is not None and reim.belgium_cap_eur_per_kwh is not None:
        belgium_cap_compliant = reim.rate_per_kwh <= reim.belgium_cap_eur_per_kwh

    reim_history: list[dict[str, Any]] = []
    if reim and reim.history:
        for h in reim.history:
            reim_history.append(
                {
                    "valid_from": h.valid_from.isoformat(),
                    "rate_per_kwh": h.rate_per_kwh,
                    "currency": h.currency,
                }
            )

    session_key_union: list[str] | None = None
    if bool(opt.get(CONF_DEBUG_SESSION_JSON_KEYS)):
        u: set[str] = set()
        for s in d.sessions_active + d.sessions_recent:
            u.update(str(k) for k in s.raw)
        session_key_union = sorted(u)

    stale_sections: list[str] = []
    if d.api_partial:
        stale_sections.append("api")
    if d.consumption and d.consumption.stale:
        stale_sections.append("consumption")

    unsupported_connectors: list[dict[str, Any]] = []
    for ch in d.chargers:
        for co in ch.connectors:
            if co.mode == "UNKNOWN":
                feat = d.charger_features.get(ch.serial)
                if feat and not feat.supports_smart_mode:
                    unsupported_connectors.append(
                        {
                            "charger_serial": ch.serial,
                            "connector": co.position,
                            "reason": "mode_unknown_dc_or_limited",
                        }
                    )

    inst = d.installation
    inst_excerpt = _raw_excerpt(inst.raw, 25) if inst and inst.raw else {}

    update_s = int(
        opt.get(CONF_UPDATE_INTERVAL)
        or entry.data.get(CONF_UPDATE_INTERVAL)
        or DEFAULT_UPDATE_INTERVAL
    )

    coordinator_ok = getattr(coordinator, "last_update_success", True)

    chargers_lb = [
        {
            "serial": c.serial,
            "load_balance": _charger_load_balance(c),
        }
        for c in d.chargers
    ]

    month_key = (
        d.reimbursement_monthly.month
        if d.reimbursement_monthly
        else datetime.now(UTC).strftime("%Y-%m")
    )
    savings_currency = "EUR"
    if d.tariffs and d.tariffs[0].currency:
        savings_currency = str(d.tariffs[0].currency)
    elif reim:
        savings_currency = str(reim.currency)

    active_ev_hints = _build_active_ev_hints(
        d.consumption,
        _sessions_for_ev_hints(
            list(d.sessions_active),
            list(d.sessions_recent),
            d.chargers,
        ),
        d.chargers,
        d.charger_features,
        chargers_lb,
    )
    connector_explanations = build_connector_explanations(
        d.consumption,
        list(d.chargers),
        d.charger_features,
        chargers_lb,
        list(d.sessions_active),
        list(d.sessions_recent),
    )
    operational_flags = _build_operational_flags(d, active_ev_hints)
    peak_raw = opt.get(CONF_PEAK_PHASE_CURRENT_WARNING_A)
    peak_phase_current_warning_a: float | None
    try:
        peak_phase_current_warning_a = (
            float(peak_raw) if peak_raw is not None and peak_raw != "" else None
        )
    except (TypeError, ValueError):
        peak_phase_current_warning_a = None

    seen_assistant: set[str] = set()
    sessions_for_assistant: list[ChargingSession] = []
    for s in d.sessions_active + d.sessions_recent:
        if s.id in seen_assistant:
            continue
        seen_assistant.add(s.id)
        sessions_for_assistant.append(s)

    off_peak_raw = opt.get(CONF_ASSISTANT_OFF_PEAK_PRICE_PER_KWH)
    try:
        off_peak_f = (
            float(off_peak_raw)
            if off_peak_raw is not None and off_peak_raw != ""
            else None
        )
    except (TypeError, ValueError):
        off_peak_f = None

    try:
        assumed_kwh = float(
            opt.get(CONF_ASSISTANT_ASSUMED_SESSION_KWH)
            or DEFAULT_ASSISTANT_ASSUMED_SESSION_KWH
        )
    except (TypeError, ValueError):
        assumed_kwh = float(DEFAULT_ASSISTANT_ASSUMED_SESSION_KWH)

    assistant_suggestions = build_assistant_suggestions(
        d.consumption,
        list(d.chargers),
        sessions_for_assistant,
        tariff_per_kwh=tariff_f,
        currency=savings_currency,
        off_peak_price_per_kwh=off_peak_f,
        assumed_session_kwh=assumed_kwh,
        has_three_phase=d.installation_features.has_three_phase,
    )

    overview_context: dict[str, Any] = {
        "month_smart_savings": _compute_month_smart_savings_eur(
            list(d.sessions_active) + list(d.sessions_recent),
            tariff_f,
            month_key,
            savings_currency,
        ),
        "active_ev_hints": active_ev_hints,
        "connector_explanations": connector_explanations,
        "operational_flags": operational_flags,
        "estimated_ev_power_w": estimated_ev_power_w,
        "peak_phase_current_warning_a": peak_phase_current_warning_a,
        "assistant_suggestions": assistant_suggestions,
    }

    ei_opts = energy_intelligence_options_from_mapping(opt, country)
    peak_kw = None
    peak_n = None
    peak_method = None
    peak_unavail = None
    if intelligence_peak_sample:
        peak_kw = intelligence_peak_sample.get("peak_kw_sampled")
        peak_n = intelligence_peak_sample.get("sample_count")
        peak_method = intelligence_peak_sample.get("method")
        peak_unavail = intelligence_peak_sample.get("unavailable_reason")

    energy_intelligence = compute_energy_intelligence(
        list(d.sessions_active) + list(d.sessions_recent),
        list(d.tariffs),
        d.reimbursement,
        list(d.chargers),
        now_utc=datetime.now(UTC),
        peak_kw_sampled=peak_kw,
        peak_sample_count=peak_n,
        peak_method=peak_method,
        peak_unavailable_reason=peak_unavail,
        options=ei_opts,
    )

    discovery_payload = build_discovery_payload(
        d,
        update_interval_s=update_s,
        coordinator_last_update_success=coordinator_ok,
        consumption_stale=bool(d.consumption and d.consumption.stale),
    )

    advanced_allowed = bool(opt.get(CONF_ADVANCED_PANEL))
    advanced_included = advanced_allowed and include_advanced_requested

    v2: dict[str, Any] = {
        "schema_version": 2,
        "country_code": country,
        "meta": {
            "schema_version": 2,
            "update_interval_s": update_s,
            "coordinator_last_update_success": coordinator_ok,
            "consumption_stale": bool(d.consumption and d.consumption.stale),
            "advanced_panel_allowed": advanced_allowed,
            "advanced_data_included": advanced_included,
        },
        "entity_map": build_entity_map(hass, entry),
        "sessions_enriched": sessions_enriched,
        "economics": {
            "today_kwh": today_kwh,
            "today_pending_eur": today_pending,
            "today_charging_cost_estimate_eur": today_charging_cost_estimate_eur,
            "tariff_primary": _tariff_primary_dict(d.tariffs),
            "tariffs_all": [
                {
                    "id": t.id,
                    "name": t.name,
                    "currency": t.currency,
                    "price_per_kwh": t.price_per_kwh,
                }
                for t in d.tariffs
            ],
            "reimbursement_history": reim_history,
            "belgium_cap_compliant": belgium_cap_compliant,
        },
        "diagnostics": {
            "api_partial": d.api_partial,
            "last_error": d.last_error,
            "installation_features": base.get("installation_features"),
            "charger_features_summary": base.get("charger_features"),
            "unsupported_connectors": unsupported_connectors,
            "stale_sections": stale_sections,
            "installation_raw_excerpt": inst_excerpt,
            "recent_session_errors": [],
            "session_json_keys_union": session_key_union,
            "discovery_partial": d.discovery.partial,
            "discovery_node_count": len(d.discovery.nodes),
        },
        "chargers_extended": chargers_lb,
        "overview_context": overview_context,
        "energy_intelligence": energy_intelligence,
        "discovery": discovery_payload,
    }
    base.update(v2)
    if advanced_included:
        base["advanced"] = _build_advanced_payload(coordinator, d, update_s)
    return base
