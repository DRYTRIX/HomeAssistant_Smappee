"""Heuristic charging explanation engine (grid / solar / smart / limits).

Signals come from Smappee API strings and load-balancing blobs; messages avoid
claiming certainty when classification is inferred.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from .models import (
    ChargerFeatures,
    ChargingSession,
    ConnectorState,
    ConsumptionSummary,
    EVCharger,
)

SOLAR_LOW_W = 400.0
LB_EPSILON_A = 0.51

REASON_META: dict[str, dict[str, str]] = {
    "grid_capacity_limit": {
        "message": "Charging is limited by dynamic load balancing (grid / household headroom).",
        "badge_label": "Limited by grid",
        "tone": "warn",
    },
    "user_current_limit": {
        "message": "Charge speed follows your set current limit on this connector.",
        "badge_label": "User current limit",
        "tone": "info",
    },
    "smart_charging": {
        "message": "Smart charging is adjusting power based on grid, tariff, or site rules.",
        "badge_label": "Smart charging active",
        "tone": "info",
    },
    "solar_wait": {
        "message": "Charging is waiting for enough solar (or solar-mode rules).",
        "badge_label": "Waiting for solar",
        "tone": "info",
    },
    "overload_protection": {
        "message": "Charging is reduced or paused due to overload protection.",
        "badge_label": "Paused due to overload",
        "tone": "warn",
    },
    "manual_pause": {
        "message": "Charging is paused (manual or app).",
        "badge_label": "Paused",
        "tone": "neutral",
    },
    "waiting_to_charge": {
        "message": "Session is queued or waiting to start.",
        "badge_label": "Waiting",
        "tone": "info",
    },
    "normal": {
        "message": "Charging is active within current limits.",
        "badge_label": "Charging",
        "tone": "neutral",
    },
    "idle": {
        "message": "No active charging session on this connector.",
        "badge_label": "Idle",
        "tone": "neutral",
    },
    "unknown": {
        "message": "Could not classify charging behaviour from available data.",
        "badge_label": "Unknown",
        "tone": "neutral",
    },
}

SUGGESTIONS: dict[str, list[dict[str, str]]] = {
    "grid_capacity_limit": [
        {"id": "reduce_loads", "label": "Reduce other large household loads if safe"},
        {"id": "smappee_lb", "label": "Review load-balancing / main limit in the Smappee app"},
    ],
    "user_current_limit": [
        {"id": "raise_current", "label": "Increase the connector current (if wiring and fuse allow)"},
    ],
    "smart_charging": [
        {"id": "wait_window", "label": "Wait for the next smart window or check tariff rules in Smappee"},
        {"id": "switch_mode", "label": "Switch to Standard mode if you need immediate full power"},
    ],
    "solar_wait": [
        {"id": "wait_solar", "label": "Wait for higher solar production"},
        {"id": "switch_standard", "label": "Switch to Standard mode to draw from the grid"},
    ],
    "overload_protection": [
        {"id": "reduce_loads", "label": "Reduce demand; overload protection should clear when headroom returns"},
        {"id": "check_smappee", "label": "Check alerts and limits in the Smappee app"},
    ],
    "manual_pause": [
        {"id": "resume", "label": "Press Start or resume from the app / Home Assistant"},
    ],
    "waiting_to_charge": [
        {"id": "wait_queue", "label": "Wait for the session to start, or check the Smappee queue"},
    ],
}


def parse_load_balance_amps(val: Any, depth: int = 0) -> float | None:
    """Best-effort extract a current in A from nested load-balance JSON."""
    if depth > 6:
        return None
    if isinstance(val, (int, float)) and 0 < val <= 80:
        return float(val)
    if isinstance(val, dict):
        keys_prio = (
            "availablecurrent",
            "available_current",
            "maxcurrent",
            "max_current",
            "value",
        )
        lower_map = {str(k).lower().replace("_", ""): v for k, v in val.items()}
        for pk in keys_prio:
            pkn = pk.replace("_", "")
            if pkn in lower_map:
                got = parse_load_balance_amps(lower_map[pkn], depth + 1)
                if got is not None:
                    return got
        for v in val.values():
            got = parse_load_balance_amps(v, depth + 1)
            if got is not None:
                return got
    if isinstance(val, list):
        for item in val:
            got = parse_load_balance_amps(item, depth + 1)
            if got is not None:
                return got
    return None


def pause_explanation(status: str, connector_mode: str) -> dict[str, str]:
    """Legacy pause/charge classification (codes consumed by panel + technical.pause_code)."""
    st = (status or "").upper()
    mode = (connector_mode or "").upper()
    if mode == "PAUSED" or "PAUSED" in st or "PAUSE" in st:
        if any(x in st for x in ("SMART", "WAIT", "SOLAR", "DEFER")):
            return {
                "code": "smart_or_solar_wait",
                "title": "Paused by smart / solar logic",
                "detail": (
                    "Charging is paused while smart or solar mode waits for "
                    "favourable grid or solar conditions. Check the Smappee app "
                    "for the exact rule."
                ),
            }
        return {
            "code": "wallbox_paused",
            "title": "Charging paused",
            "detail": (
                "The connector is in PAUSED mode or the session was paused "
                "(manual stop from app or Home Assistant)."
            ),
        }
    if any(x in st for x in ("WAIT", "DEFER", "QUEUED")):
        return {
            "code": "waiting",
            "title": "Waiting to charge",
            "detail": "Session is waiting; Smappee has not started delivery yet.",
        }
    if st in ("CHARGING", "STARTED") or "CHARG" in st:
        return {
            "code": "charging",
            "title": "Charging",
            "detail": "Energy is being delivered. See limit chain below for speed factors.",
        }
    return {
        "code": "unknown",
        "title": "Session status",
        "detail": f"API status: {status or 'unknown'}. Open the Smappee app for details.",
    }


def build_limit_chain(
    current_a: float | None,
    max_hardware_a: float | None,
    connector_mode: str,
    lb_value: Any,
) -> list[dict[str, str]]:
    """Ordered human-readable limit factors for the technical panel."""
    chain: list[dict[str, str]] = []
    mode_u = (connector_mode or "").upper()
    if max_hardware_a is not None and max_hardware_a > 0:
        chain.append(
            {
                "factor": "hardware_max",
                "label": "Hardware maximum",
                "value": f"{int(max_hardware_a)} A",
                "source": "config",
            }
        )
    lb_amps = parse_load_balance_amps(lb_value)
    if current_a is not None and current_a > 0:
        chain.append(
            {
                "factor": "set_current",
                "label": "Set current limit",
                "value": f"{int(round(current_a))} A",
                "source": "live",
            }
        )
    if lb_amps is not None:
        chain.append(
            {
                "factor": "load_balance",
                "label": "Load balancing (parsed)",
                "value": f"≤ {lb_amps:.0f} A",
                "source": "estimated",
            }
        )
    if mode_u == "SMART":
        chain.append(
            {
                "factor": "smart_mode",
                "label": "Smart mode",
                "value": "May throttle below set limit",
                "source": "estimated",
            }
        )
    elif mode_u == "NORMAL" and lb_amps is None:
        chain.append(
            {
                "factor": "normal_mode",
                "label": "Standard mode",
                "value": "Typically follows set current unless load balancing applies",
                "source": "estimated",
            }
        )
    return chain


def _status_upper(session: ChargingSession | None) -> str:
    return (session.status if session else "").upper()


def _session_suggests_charging(session: ChargingSession | None) -> bool:
    st = _status_upper(session)
    return st in ("CHARGING", "STARTED") or "CHARG" in st


def _overload_signal(
    status: str,
    load_balance_info: dict[str, Any],
) -> bool:
    st = (status or "").upper()
    if any(k in st for k in ("OVERLOAD", "TRIP", "PROTECTION")):
        return True
    sk = str(load_balance_info.get("source_key") or "").lower().replace("_", "")
    return "overload" in sk


def _sum_phase_amps(consumption: ConsumptionSummary | None) -> float | None:
    if not consumption or not consumption.phase_metrics:
        return None
    pm = consumption.phase_metrics
    vals = [pm.l1_current, pm.l2_current, pm.l3_current]
    nums = [float(x) for x in vals if x is not None]
    if not nums:
        return None
    return sum(nums)


def pick_session_for_connector(
    charger_serial: str,
    position: int,
    connector: ConnectorState,
    sessions_active: list[ChargingSession],
    sessions_recent: list[ChargingSession],
) -> ChargingSession | None:
    """Match session to connector (active list, then recent if connector busy)."""
    for s in sessions_active:
        if s.charger_serial == charger_serial and s.connector == position:
            return s
    if not connector.session_active:
        return None
    candidates = [
        x
        for x in sessions_recent
        if x.charger_serial == charger_serial and x.connector == position
    ]
    candidates.sort(
        key=lambda x: x.start or datetime.min.replace(tzinfo=UTC),
        reverse=True,
    )
    for s in candidates:
        st = (s.status or "").upper()
        if st in ("COMPLETED", "STOPPED", "ENDED"):
            continue
        return s
    return None


def _suggestions_for(reason: str) -> list[dict[str, str]]:
    return list(SUGGESTIONS.get(reason, []))


def explain_connector(
    consumption: ConsumptionSummary | None,
    charger: EVCharger,
    connector: ConnectorState,
    session: ChargingSession | None,
    features: ChargerFeatures | None,
    load_balance_info: dict[str, Any],
) -> dict[str, Any]:
    """Full structured explanation for one connector."""
    lb_raw = load_balance_info.get("value")
    lb_amps = parse_load_balance_amps(lb_raw)
    max_hw = float(features.max_current_a) if features and features.max_current_a else None
    cur_a = float(connector.current_a) if connector.current_a is not None else None
    mode_u = (connector.mode or "").upper()
    st = session.status if session else ""
    pause = pause_explanation(st, connector.mode)
    limit_chain = build_limit_chain(cur_a, max_hw, connector.mode, lb_raw)

    solar_w = float(consumption.solar_w) if consumption and consumption.solar_w is not None else None
    phase_amps_sum = _sum_phase_amps(consumption)

    signals: dict[str, Any] = {
        "charger_serial": charger.serial,
        "load_balance_reported": bool(load_balance_info.get("reported")),
        "load_balance_source_key": load_balance_info.get("source_key"),
        "parsed_lb_amps": lb_amps,
        "solar_w": solar_w,
        "phase_current_sum_a": phase_amps_sum,
        "connector_mode": connector.mode,
        "session_status": st or None,
    }

    status: str = "unknown"
    reason: str = "unknown"
    details: dict[str, Any] = {}

    has_session = session is not None or connector.session_active
    charging = _session_suggests_charging(session) and mode_u != "PAUSED"
    paused_mode = mode_u == "PAUSED" or (
        session is not None and ("PAUSE" in _status_upper(session) or _status_upper(session) == "PAUSED")
    )

    if not has_session and not connector.session_active:
        status = "idle"
        reason = "idle"
    elif _overload_signal(st, load_balance_info) and (paused_mode or not charging):
        status = "paused" if paused_mode else "waiting"
        reason = "overload_protection"
        details["hint"] = "overload_keyword_in_status_or_load_balance"
    elif pause["code"] == "waiting":
        status = "waiting"
        reason = "waiting_to_charge"
    elif pause["code"] == "smart_or_solar_wait":
        st_u = _status_upper(session)
        solar_hint = "SOLAR" in st_u or "SOLAR" in mode_u
        if not solar_hint and solar_w is not None and solar_w < SOLAR_LOW_W:
            solar_hint = True
        if solar_hint:
            status = "waiting"
            reason = "solar_wait"
            if solar_w is not None:
                details["solar_w"] = round(solar_w, 0)
        else:
            status = "paused"
            reason = "smart_charging"
            details["note"] = "Smart logic is holding the session; see Smappee for rules"
    elif pause["code"] == "wallbox_paused":
        status = "paused"
        reason = "manual_pause"
    elif pause["code"] == "charging" or charging:
        status = "charging"
        reason = "normal"
        if lb_amps is not None and cur_a is not None and lb_amps < cur_a - LB_EPSILON_A:
            status = "limited"
            reason = "grid_capacity_limit"
            details["dynamic_limit_a"] = round(lb_amps, 1)
            details["set_current_a"] = round(cur_a, 1)
        elif mode_u == "SMART":
            if status == "limited":
                pass
            else:
                reason = "smart_charging"
                details["note"] = "Smart mode may still throttle below the set limit"
        elif (
            cur_a is not None
            and max_hw is not None
            and cur_a < max_hw - LB_EPSILON_A
            and (lb_amps is None or lb_amps >= cur_a - LB_EPSILON_A)
        ):
            status = "limited"
            reason = "user_current_limit"
            details["set_current_a"] = round(cur_a, 1)
            details["hardware_max_a"] = round(max_hw, 1)
    elif pause["code"] == "unknown" and has_session:
        status = "unknown"
        reason = "unknown"

    meta = REASON_META.get(reason, REASON_META["unknown"])
    message = meta["message"]
    if reason == "grid_capacity_limit" and details.get("dynamic_limit_a") is not None:
        message = (
            f"Charging is limited: dynamic headroom is about {details['dynamic_limit_a']} A "
            f"(set limit {details.get('set_current_a', '?')} A)."
        )

    out: dict[str, Any] = {
        "status": status,
        "reason": reason,
        "message": message,
        "details": details,
        "badge": {
            "label": meta["badge_label"],
            "tone": meta["tone"],
        },
        "suggestions": _suggestions_for(reason),
        "technical": {
            "limit_chain": limit_chain,
            "pause_code": pause["code"],
            "signals": signals,
        },
    }
    return out


def build_connector_explanations(
    consumption: ConsumptionSummary | None,
    chargers: list[EVCharger],
    charger_features: dict[str, ChargerFeatures],
    chargers_lb: list[dict[str, Any]],
    sessions_active: list[ChargingSession],
    sessions_recent: list[ChargingSession],
) -> list[dict[str, Any]]:
    """One row per connector with charger_serial, connector, and explanation."""
    lb_by_serial = {x["serial"]: x.get("load_balance", {}) for x in chargers_lb}
    rows: list[dict[str, Any]] = []
    for ch in chargers:
        feat = charger_features.get(ch.serial)
        lb_info = lb_by_serial.get(ch.serial, {"reported": False, "value": None})
        for co in ch.connectors:
            sess = pick_session_for_connector(
                ch.serial, co.position, co, sessions_active, sessions_recent
            )
            expl = explain_connector(consumption, ch, co, sess, feat, lb_info)
            rows.append(
                {
                    "charger_serial": ch.serial,
                    "connector": co.position,
                    "explanation": expl,
                }
            )
    return rows


def explanation_for_hint(
    consumption: ConsumptionSummary | None,
    chargers: list[EVCharger],
    charger_features: dict[str, ChargerFeatures],
    chargers_lb: list[dict[str, Any]],
    session: ChargingSession,
) -> dict[str, Any]:
    """Explanation object for one active-ev-hint session row."""
    ch, co = _find_connector(chargers, session.charger_serial, session.connector)
    if co is None:
        co = ConnectorState(position=session.connector, mode="UNKNOWN")
    if ch is None:
        ch = EVCharger(
            serial=session.charger_serial,
            name="",
            connectors=[co],
        )
    lb_by_serial = {x["serial"]: x.get("load_balance", {}) for x in chargers_lb}
    lb_info = lb_by_serial.get(session.charger_serial, {"reported": False, "value": None})
    feat = charger_features.get(session.charger_serial)
    return explain_connector(consumption, ch, co, session, feat, lb_info)


def _find_connector(
    chargers: list[EVCharger], serial: str, position: int
) -> tuple[EVCharger | None, ConnectorState | None]:
    for c in chargers:
        if c.serial != serial:
            continue
        for co in c.connectors:
            if co.position == position:
                return c, co
    return None, None
