"""Energy Intelligence: cost, solar split, smart-charging counterfactuals, reimbursement buckets.

All aggregates use UTC calendar boundaries unless noted. See docs/ENERGY_INTELLIGENCE.md.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from .const import (
    CONF_BE_CAPACITY_CONTRACT_KW,
    CONF_BE_CAPACITY_EUR_PER_KW_YEAR,
    CONF_BE_CAPACITY_WARN_PCT,
    CONF_EI_CHARGE_PHASES,
    CONF_EI_ENABLE_CAPACITY_TRACKING,
    CONF_EI_LINE_VOLTAGE,
    DEFAULT_BE_CAPACITY_WARN_PCT,
    DEFAULT_EI_CHARGE_PHASES,
    DEFAULT_EI_LINE_VOLTAGE,
)
from .models import (
    ChargingSession,
    EVCharger,
    ReimbursementConfig,
    TariffInfo,
)

Bucket = Literal["completed", "in_progress", "other"]


@dataclass(frozen=True, slots=True)
class EnergyIntelligenceOptions:
    """User-configurable assumptions (from config entry options)."""

    line_voltage: float = 230.0
    charge_phases: int = 1
    country_code: str | None = None
    enable_capacity_tracking: bool = False
    capacity_contract_kw: float | None = None
    capacity_warn_pct: float = 80.0
    capacity_eur_per_kw_year: float | None = None


def _primary_tariff_price(tariffs: list[TariffInfo]) -> float | None:
    if not tariffs:
        return None
    p = tariffs[0].price_per_kwh
    return float(p) if p is not None else None


def _primary_currency(tariffs: list[TariffInfo], reim: ReimbursementConfig | None) -> str:
    if tariffs and tariffs[0].currency:
        return str(tariffs[0].currency)
    if reim:
        return str(reim.currency)
    return "EUR"


def _tariff_price_for_session(
    s: ChargingSession, tariffs: list[TariffInfo], primary: float | None
) -> float | None:
    tid = (s.tariff_id or "").strip()
    if tid:
        for t in tariffs:
            if t.id is not None and str(t.id).strip() == tid and t.price_per_kwh is not None:
                return float(t.price_per_kwh)
    return primary


def _session_kwh(s: ChargingSession) -> float | None:
    if s.energy_wh is None:
        return None
    kwh = s.energy_wh / 1000.0
    return kwh if kwh > 0 else None


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


def session_is_smart_or_solar(s: ChargingSession) -> bool:
    """Heuristic: session used smart/solar charging (for counterfactual scope)."""
    st = (s.status or "").upper()
    if any(x in st for x in ("SMART", "SOLAR", "WAIT", "DEFER")):
        return True
    raw_mode = s.raw.get("mode") or s.raw.get("chargingMode")
    if raw_mode:
        m = str(raw_mode).upper()
        if "SMART" in m or "SOLAR" in m:
            return True
    em = _effective_mode_from_session(s)
    if em and em in ("smart", "solar"):
        return True
    return False


def _reimbursement_rate(cfg: ReimbursementConfig | None) -> float | None:
    if cfg is None:
        return None
    rate = float(cfg.rate_per_kwh)
    if cfg.belgium_cap_eur_per_kwh is not None:
        rate = min(rate, float(cfg.belgium_cap_eur_per_kwh))
    return rate


def _session_reimbursement_estimate(
    s: ChargingSession, rate: float | None
) -> float | None:
    kwh = _session_kwh(s)
    if kwh is None or rate is None:
        return None
    return round(kwh * rate, 4)


def _session_cost_preferred(
    s: ChargingSession, unit_price: float | None
) -> float | None:
    if s.cost_amount is not None:
        return round(float(s.cost_amount), 4)
    kwh = _session_kwh(s)
    if kwh is None or unit_price is None:
        return None
    return round(kwh * unit_price, 4)


def _session_bucket(status: str) -> Bucket:
    st = (status or "").upper()
    if st in ("COMPLETED", "STOPPED", "ENDED"):
        return "completed"
    if st in ("CHARGING", "STARTED") or "PAUSE" in st or st == "PAUSED":
        return "in_progress"
    return "other"


def _month_key(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC).strftime("%Y-%m")


def _day_key(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC).strftime("%Y-%m-%d")


def _dedupe_sessions(sessions: list[ChargingSession]) -> list[ChargingSession]:
    seen: set[str] = set()
    out: list[ChargingSession] = []
    for s in sessions:
        if s.id in seen:
            continue
        seen.add(s.id)
        out.append(s)
    return out


def _charging_power_estimate_w(chargers: list[EVCharger], volts: float, phases: int) -> float | None:
    total_a = 0.0
    any_active = False
    for ch in chargers:
        for co in ch.connectors:
            if not co.session_active:
                continue
            any_active = True
            if co.current_a is not None and co.current_a > 0:
                total_a += float(co.current_a)
    if not any_active:
        return None
    if total_a <= 0:
        return None
    return total_a * float(volts) * float(phases)


def compute_energy_intelligence(
    sessions: list[ChargingSession],
    tariffs: list[TariffInfo],
    reimbursement: ReimbursementConfig | None,
    chargers: list[EVCharger],
    *,
    now_utc: datetime | None = None,
    peak_kw_sampled: float | None = None,
    peak_sample_count: int | None = None,
    peak_method: str | None = None,
    peak_unavailable_reason: str | None = None,
    options: EnergyIntelligenceOptions | None = None,
    daily_series_days: int = 14,
) -> dict[str, Any]:
    """Build the panel `energy_intelligence` object."""
    opt = options or EnergyIntelligenceOptions()
    now = now_utc or datetime.now(UTC)
    if now.tzinfo is None:
        now = now.replace(tzinfo=UTC)

    today_start = now.astimezone(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    month_key = now.strftime("%Y-%m")
    series_start = today_start - timedelta(days=daily_series_days - 1)

    primary_p = _primary_tariff_price(tariffs)
    currency = _primary_currency(tariffs, reimbursement)
    reim_rate = _reimbursement_rate(reimbursement)

    uniq = _dedupe_sessions(sessions)

    today_kwh = 0.0
    today_cost = 0.0
    month_kwh = 0.0
    month_cost = 0.0
    month_cost_api = 0.0
    month_cost_estimated = 0.0

    daily: dict[str, dict[str, float]] = {}

    smart_counterfactual = 0.0
    smart_actual = 0.0
    smart_sessions_n = 0

    solar_weighted_num = 0.0
    solar_kwh = 0.0
    grid_kwh = 0.0
    unknown_solar_kwh = 0.0
    month_kwh_for_solar = 0.0

    reim_completed_kwh = 0.0
    reim_completed_amt = 0.0
    reim_in_progress_kwh = 0.0
    reim_in_progress_amt = 0.0
    reim_other_kwh = 0.0
    reim_other_amt = 0.0

    per_session_rows: list[dict[str, Any]] = []

    for s in uniq:
        if s.start is None:
            continue
        start = s.start
        if start.tzinfo is None:
            start = start.replace(tzinfo=UTC)
        start = start.astimezone(UTC)

        kwh = _session_kwh(s)
        unit = _tariff_price_for_session(s, tariffs, primary_p)
        cost_pref = _session_cost_preferred(s, unit)
        reim_est = _session_reimbursement_estimate(s, reim_rate)

        bucket = _session_bucket(s.status or "")

        if _month_key(start) == month_key and kwh is not None:
            month_kwh += kwh
            if cost_pref is not None:
                month_cost += cost_pref
                if s.cost_amount is not None:
                    month_cost_api += float(s.cost_amount)
                else:
                    month_cost_estimated += cost_pref
            if s.solar_share_pct is not None:
                p = float(s.solar_share_pct)
                solar_weighted_num += kwh * p
                solar_kwh += kwh * (p / 100.0)
                grid_kwh += kwh * (1.0 - p / 100.0)
                month_kwh_for_solar += kwh
            else:
                unknown_solar_kwh += kwh
                month_kwh_for_solar += kwh

            if reim_est is not None:
                if bucket == "completed":
                    reim_completed_kwh += kwh
                    reim_completed_amt += reim_est
                elif bucket == "in_progress":
                    reim_in_progress_kwh += kwh
                    reim_in_progress_amt += reim_est
                else:
                    reim_other_kwh += kwh
                    reim_other_amt += reim_est

        if start >= today_start and kwh is not None:
            today_kwh += kwh
            if cost_pref is not None:
                today_cost += cost_pref

        if start >= series_start and kwh is not None and cost_pref is not None:
            dk = _day_key(start)
            if dk not in daily:
                daily[dk] = {"kwh": 0.0, "cost": 0.0}
            daily[dk]["kwh"] += kwh
            daily[dk]["cost"] += cost_pref

        if session_is_smart_or_solar(s) and kwh is not None and primary_p is not None:
            smart_counterfactual += kwh * primary_p
            smart_sessions_n += 1
            if cost_pref is not None:
                smart_actual += cost_pref

        per_session_rows.append(
            {
                "id": s.id,
                "start": start.isoformat(),
                "status": s.status,
                "kwh": round(kwh, 4) if kwh is not None else None,
                "unit_price_per_kwh": round(unit, 6) if unit is not None else None,
                "cost_preferred": cost_pref,
                "reimbursement_estimate": reim_est,
                "solar_share_pct": s.solar_share_pct,
                "bucket": bucket,
                "smart_or_solar": session_is_smart_or_solar(s),
            }
        )

    weighted_solar_pct: float | None = None
    if month_kwh_for_solar > 0 and solar_weighted_num > 0:
        weighted_solar_pct = round(solar_weighted_num / month_kwh_for_solar, 2)

    savings_raw = smart_counterfactual - smart_actual
    savings_display = max(0.0, round(savings_raw, 4))

    daily_list: list[dict[str, Any]] = []
    for i in range(daily_series_days):
        d = (series_start + timedelta(days=i)).strftime("%Y-%m-%d")
        row = daily.get(d, {"kwh": 0.0, "cost": 0.0})
        daily_list.append(
            {
                "date": d,
                "kwh": round(row["kwh"], 3),
                "cost": round(row["cost"], 4),
            }
        )

    power_w = _charging_power_estimate_w(
        chargers, opt.line_voltage, max(1, int(opt.charge_phases))
    )
    realtime_eur_per_h: float | None = None
    if power_w is not None and primary_p is not None:
        realtime_eur_per_h = round((power_w / 1000.0) * primary_p, 4)

    active_session_cost_sum = 0.0
    active_session_n = 0
    for s in uniq:
        st = (s.status or "").upper()
        if st not in ("CHARGING", "STARTED"):
            continue
        unit = _tariff_price_for_session(s, tariffs, primary_p)
        cp = _session_cost_preferred(s, unit)
        if cp is not None:
            active_session_cost_sum += cp
            active_session_n += 1

    capacity_be: dict[str, Any] = {
        "enabled": bool(
            opt.enable_capacity_tracking
            and (opt.country_code or "").upper() == "BE"
        ),
        "contract_kw": opt.capacity_contract_kw,
        "warn_pct": opt.capacity_warn_pct,
        "peak_kw_sampled": peak_kw_sampled,
        "sample_count": peak_sample_count,
        "method": peak_method,
        "unavailable_reason": peak_unavailable_reason,
        "utilization_pct": None,
        "warning_level": None,
        "annual_impact_estimate_eur": None,
    }

    if capacity_be["enabled"] and opt.capacity_contract_kw and opt.capacity_contract_kw > 0:
        if peak_kw_sampled is not None:
            util = 100.0 * peak_kw_sampled / float(opt.capacity_contract_kw)
            capacity_be["utilization_pct"] = round(util, 1)
            warn = float(opt.capacity_warn_pct)
            if util >= 100.0:
                capacity_be["warning_level"] = "critical"
            elif util >= warn:
                capacity_be["warning_level"] = "warn"
            else:
                capacity_be["warning_level"] = "ok"
        if (
            peak_kw_sampled is not None
            and opt.capacity_eur_per_kw_year is not None
            and opt.capacity_eur_per_kw_year > 0
        ):
            capacity_be["annual_impact_estimate_eur"] = round(
                peak_kw_sampled * float(opt.capacity_eur_per_kw_year),
                2,
            )
    elif capacity_be["enabled"] and peak_unavailable_reason:
        capacity_be["warning_level"] = "unknown"

    per_session_rows.sort(key=lambda r: r.get("start") or "", reverse=True)
    top_sessions = per_session_rows[:15]

    return {
        "schema_version": 1,
        "currency": currency,
        "boundaries": "UTC_calendar",
        "costs": {
            "primary_tariff_per_kwh": primary_p,
            "realtime_estimate_eur_per_h": realtime_eur_per_h,
            "realtime_power_estimate_w": round(power_w, 0) if power_w is not None else None,
            "charging_power_assumption": {
                "line_voltage_v": opt.line_voltage,
                "phases": max(1, int(opt.charge_phases)),
            },
            "active_sessions_cost_sum": round(active_session_cost_sum, 4)
            if active_session_n
            else None,
            "active_sessions_count": active_session_n,
            "today": {
                "kwh": round(today_kwh, 4),
                "cost": round(today_cost, 4),
            },
            "month": {
                "key": month_key,
                "kwh": round(month_kwh, 4),
                "cost": round(month_cost, 4),
                "cost_from_api": round(month_cost_api, 4) if month_cost_api else None,
                "cost_from_estimate": round(month_cost_estimated, 4)
                if month_cost_estimated
                else None,
            },
            "daily_series": daily_list,
        },
        "smart_charging": {
            "month_key": month_key,
            "sessions_in_scope": smart_sessions_n,
            "counterfactual_flat_grid_eur": round(smart_counterfactual, 4),
            "actual_cost_preferred_eur": round(smart_actual, 4),
            "savings_eur": savings_display,
            "savings_raw_eur": round(savings_raw, 4),
            "method": "smart_solar_sessions_kwh_times_primary_tariff_minus_actual",
        },
        "solar_ev": {
            "month_key": month_key,
            "weighted_solar_pct": weighted_solar_pct,
            "solar_kwh": round(solar_kwh, 4) if month_kwh_for_solar else None,
            "grid_kwh": round(grid_kwh, 4) if month_kwh_for_solar else None,
            "unknown_solar_kwh": round(unknown_solar_kwh, 4) if unknown_solar_kwh else None,
            "month_ev_kwh": round(month_kwh_for_solar, 4) if month_kwh_for_solar else None,
        },
        "reimbursement": {
            "month_key": month_key,
            "currency": reimbursement.currency if reimbursement else currency,
            "completed": {
                "kwh": round(reim_completed_kwh, 4),
                "amount": round(reim_completed_amt, 4),
            },
            "in_progress": {
                "kwh": round(reim_in_progress_kwh, 4),
                "amount": round(reim_in_progress_amt, 4),
            },
            "other": {
                "kwh": round(reim_other_kwh, 4),
                "amount": round(reim_other_amt, 4),
            },
            "sessions_preview": top_sessions,
        },
        "capacity_be": capacity_be,
        "insights": _build_insights(
            weighted_solar_pct,
            capacity_be,
            savings_raw,
            month_kwh,
            unknown_solar_kwh,
            month_kwh_for_solar,
        ),
    }


def _build_insights(
    weighted_solar_pct: float | None,
    capacity_be: dict[str, Any],
    savings_raw: float,
    month_kwh: float,
    unknown_solar_kwh: float,
    month_kwh_for_solar: float,
) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    if weighted_solar_pct is not None and weighted_solar_pct < 15:
        out.append(
            {
                "id": "low_solar_ev",
                "severity": "info",
                "body": "EV energy this month is mostly non-solar (low solar share).",
            }
        )
    if month_kwh_for_solar > 0 and unknown_solar_kwh > 0.5 * month_kwh_for_solar:
        out.append(
            {
                "id": "solar_share_missing",
                "severity": "warn",
                "body": "Many sessions lack solar share from the API; solar split is incomplete.",
            }
        )
    if savings_raw < 0:
        out.append(
            {
                "id": "smart_savings_negative",
                "severity": "info",
                "body": "Smart-session actual cost exceeds the flat counterfactual—API cost/tariff mismatch or mixed modes.",
            }
        )
    wl = capacity_be.get("warning_level")
    if wl == "warn":
        out.append(
            {
                "id": "capacity_high",
                "severity": "warn",
                "body": "Sampled grid peak is approaching your contracted capacity (Belgium proxy).",
            }
        )
    elif wl == "critical":
        out.append(
            {
                "id": "capacity_over",
                "severity": "warn",
                "body": "Sampled grid peak exceeds contracted capacity in this proxy model.",
            }
        )
    if month_kwh <= 0 and not out:
        out.append(
            {
                "id": "no_month_data",
                "severity": "info",
                "body": "No session energy recorded for this UTC month in the current history window.",
            }
        )
    return out[:6]


def energy_intelligence_options_from_mapping(
    opt: Mapping[str, Any],
    country_code: str | None,
) -> EnergyIntelligenceOptions:
    """Build options from config entry options dict."""

    def _float_opt(key: str, default: float) -> float:
        v = opt.get(key)
        if v is None or v == "":
            return default
        try:
            return float(v)
        except (TypeError, ValueError):
            return default

    def _int_phases(key: str, default: int) -> int:
        v = opt.get(key)
        if v is None or v == "":
            return default
        try:
            return int(v)
        except (TypeError, ValueError):
            return default

    cap_kw_f: float | None = None
    cap_raw = opt.get(CONF_BE_CAPACITY_CONTRACT_KW)
    if cap_raw is not None and cap_raw != "":
        try:
            cap_kw_f = float(cap_raw)
        except (TypeError, ValueError):
            cap_kw_f = None

    eur_y_f: float | None = None
    eur_raw = opt.get(CONF_BE_CAPACITY_EUR_PER_KW_YEAR)
    if eur_raw is not None and eur_raw != "":
        try:
            eur_y_f = float(eur_raw)
        except (TypeError, ValueError):
            eur_y_f = None

    phases = max(1, min(3, _int_phases(CONF_EI_CHARGE_PHASES, DEFAULT_EI_CHARGE_PHASES)))

    return EnergyIntelligenceOptions(
        line_voltage=_float_opt(CONF_EI_LINE_VOLTAGE, DEFAULT_EI_LINE_VOLTAGE),
        charge_phases=phases,
        country_code=country_code,
        enable_capacity_tracking=bool(opt.get(CONF_EI_ENABLE_CAPACITY_TRACKING)),
        capacity_contract_kw=cap_kw_f,
        capacity_warn_pct=_float_opt(
            CONF_BE_CAPACITY_WARN_PCT, DEFAULT_BE_CAPACITY_WARN_PCT
        ),
        capacity_eur_per_kw_year=eur_y_f,
    )
