"""Monthly max grid import (W) from HA recorder — capacity-tariff proxy."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant, State

_LOGGER = logging.getLogger(__name__)


def _state_value_w(state: State | dict[str, Any]) -> float | None:
    if isinstance(state, dict):
        raw = state.get("s") or state.get("state")
    else:
        raw = state.state
    if raw is None:
        return None
    s = str(raw).strip().lower()
    if s in ("unknown", "unavailable", "", "none"):
        return None
    try:
        return float(s)
    except (TypeError, ValueError):
        return None


async def async_sample_monthly_max_grid_import_kw(
    hass: HomeAssistant,
    entity_id: str,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Return peak kW (grid import sensor is W) and sample count from recorder."""
    from homeassistant.components.recorder.history import get_significant_states
    from homeassistant.helpers.recorder import get_instance

    end = now or datetime.now(UTC)
    if end.tzinfo is None:
        end = end.replace(tzinfo=UTC)
    end = end.astimezone(UTC)
    start = end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    out: dict[str, Any] = {
        "peak_kw_sampled": None,
        "sample_count": 0,
        "method": "monthly_max_of_ha_states",
        "unavailable_reason": None,
    }

    try:
        rec = get_instance(hass)
    except KeyError:
        out["unavailable_reason"] = "recorder_not_loaded"
        return out

    def _job() -> Mapping[str, list[State | dict[str, Any]]]:
        return get_significant_states(
            hass,
            start_time=start,
            end_time=end,
            entity_ids=[entity_id],
            include_start_time_state=True,
            significant_changes_only=False,
            minimal_response=False,
            no_attributes=True,
        )

    try:
        hist = await rec.async_add_executor_job(_job)
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("recorder peak sample failed: %s", err)
        out["unavailable_reason"] = str(err)
        return out

    states_list = hist.get(entity_id) or []
    values: list[float] = []
    for st in states_list:
        w = _state_value_w(st)
        if w is not None and w >= 0:
            values.append(w)

    cur = hass.states.get(entity_id)
    if cur is not None:
        w = _state_value_w(cur)
        if w is not None and w >= 0:
            values.append(w)

    out["sample_count"] = len(values)
    if not values:
        out["unavailable_reason"] = "no_numeric_samples"
        return out

    peak_w = max(values)
    out["peak_kw_sampled"] = round(peak_w / 1000.0, 4)
    return out
