"""Heuristic charging / grid suggestions for the panel assistant (no HA imports)."""

from __future__ import annotations

from typing import Any

from .models import ChargingSession, ConsumptionSummary, EVCharger

# Tunable thresholds (watts unless noted)
EXPORT_SURPLUS_W = 400
NET_SURPLUS_SOLAR_MINUS_HOME_W = 500
GRID_IMPORT_HIGH_W = 1500
SOLAR_LOW_W = 800
PHASE_IMBALANCE_RATIO = 1.55
PHASE_POWER_MIN_W = 400


def _currency_symbol(currency: str) -> str:
    cur = (currency or "EUR").upper()
    if cur == "EUR":
        return "€"
    if cur == "USD":
        return "$"
    if cur == "GBP":
        return "£"
    return f"{cur} "


def _session_actively_charging(s: ChargingSession) -> bool:
    st = (s.status or "").upper()
    return st in ("CHARGING", "STARTED") or "CHARGING" in st


def _any_session_charging(sessions: list[ChargingSession]) -> bool:
    seen: set[str] = set()
    for s in sessions:
        if s.id in seen:
            continue
        seen.add(s.id)
        if _session_actively_charging(s):
            return True
    return False


def _ev_plugged_context(
    chargers: list[EVCharger], sessions: list[ChargingSession]
) -> bool:
    for ch in chargers:
        for co in ch.connectors:
            if co.session_active:
                return True
    seen: set[str] = set()
    for s in sessions:
        if s.id in seen:
            continue
        seen.add(s.id)
        st = (s.status or "").upper()
        if st in ("COMPLETED", "STOPPED", "ENDED"):
            continue
        if _session_actively_charging(s):
            return True
        if any(
            x in st
            for x in (
                "WAIT",
                "PAUSE",
                "QUEUE",
                "DEFER",
                "CONNECTED",
                "READY",
                "PREPARE",
            )
        ):
            return True
    return False


def _net_surplus_w(c: ConsumptionSummary) -> float | None:
    sol = c.solar_w
    home = c.consumption_w
    if sol is None or home is None:
        return None
    return float(sol - home)


def _phase_imbalance_hint(
    c: ConsumptionSummary, has_three_phase: bool
) -> bool:
    if not has_three_phase:
        return False
    pm = c.phase_metrics
    if pm is None:
        return False
    powers: list[float] = []
    for pw in (pm.l1_power_w, pm.l2_power_w, pm.l3_power_w):
        if pw is not None and pw > PHASE_POWER_MIN_W:
            powers.append(float(pw))
    if len(powers) < 2:
        return False
    hi = max(powers)
    lo = min(powers)
    if lo <= 0:
        return False
    return hi / lo >= PHASE_IMBALANCE_RATIO


def build_assistant_suggestions(
    consumption: ConsumptionSummary | None,
    chargers: list[EVCharger],
    sessions: list[ChargingSession],
    *,
    tariff_per_kwh: float | None,
    currency: str,
    off_peak_price_per_kwh: float | None,
    assumed_session_kwh: float,
    has_three_phase: bool,
) -> list[dict[str, Any]]:
    """Return ordered suggestion dicts for overview_context.assistant_suggestions."""
    out: list[dict[str, Any]] = []
    if consumption is None:
        return out

    c = consumption
    grid_imp = c.grid_import_w
    grid_exp = c.grid_export_w
    solar = c.solar_w
    net_surplus = _net_surplus_w(c)

    surplus_now = False
    if grid_exp is not None and grid_exp >= EXPORT_SURPLUS_W:
        surplus_now = True
    elif net_surplus is not None and net_surplus >= NET_SURPLUS_SOLAR_MINUS_HOME_W:
        surplus_now = True

    ev_ctx = _ev_plugged_context(chargers, sessions)
    charging = _any_session_charging(sessions)

    if surplus_now and ev_ctx and not charging:
        out.append(
            {
                "id": "charge-now-solar",
                "category": "solar",
                "severity": "info",
                "title": "Charge now to use solar",
                "body": (
                    "Surplus power is available (export or solar above home load). "
                    "Starting or resuming charging now can use that energy instead of "
                    "sending it to the grid."
                ),
            }
        )

    peak_like = (
        grid_imp is not None
        and grid_imp >= GRID_IMPORT_HIGH_W
        and (solar is None or solar < SOLAR_LOW_W)
    )

    if peak_like:
        if (
            tariff_per_kwh is not None
            and off_peak_price_per_kwh is not None
            and off_peak_price_per_kwh >= 0
            and tariff_per_kwh > off_peak_price_per_kwh
        ):
            delta = (tariff_per_kwh - off_peak_price_per_kwh) * assumed_session_kwh
            sym = _currency_symbol(currency)
            out.append(
                {
                    "id": "delay-charging-save",
                    "category": "cost",
                    "severity": "info",
                    "title": f"Delay charging to save ~{sym}{delta:.2f}",
                    "body": (
                        "At current conditions, energy is likely drawn largely from the "
                        "grid. Compared to your configured off-peak rate, deferring "
                        f"about {assumed_session_kwh:.0f} kWh could save roughly this "
                        "amount—illustrative only; verify with your supplier."
                    ),
                    "savings": {
                        "amount": round(delta, 2),
                        "currency": currency,
                        "assumed_kwh": assumed_session_kwh,
                        "note": "Illustrative vs configured off-peak rate.",
                    },
                }
            )
        elif off_peak_price_per_kwh is None:
            out.append(
                {
                    "id": "delay-charging-qualitative",
                    "category": "cost",
                    "severity": "info",
                    "title": "Consider off-peak charging",
                    "body": (
                        "Grid import is high now. If your tariff has cheaper night "
                        "or off-peak windows, delaying EV charging can reduce cost. "
                        "Set an off-peak price in integration options to see an "
                        "estimated savings range."
                    ),
                }
            )

        out.append(
            {
                "id": "reduce-peak-usage",
                "category": "peak",
                "severity": "warn",
                "title": "Reduce peak usage",
                "body": (
                    "Grid import is high while solar contribution is low. "
                    "Shifting flexible loads (including EV charging) away from this "
                    "window can lower demand charges or peak tariffs."
                ),
            }
        )

    if _phase_imbalance_hint(c, has_three_phase) and (
        grid_imp is not None and grid_imp >= 800
    ):
        out.append(
            {
                "id": "phase-imbalance",
                "category": "peak",
                "severity": "info",
                "title": "Uneven load across phases",
                "body": (
                    "One phase is carrying noticeably more power than others. "
                    "Spreading single-phase loads can reduce peak current on the "
                    "heaviest phase."
                ),
            }
        )

    return out[:5]
