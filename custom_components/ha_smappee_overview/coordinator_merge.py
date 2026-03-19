"""Pure merge helpers for coordinator state (testable without HA)."""

from __future__ import annotations

from .models import ChargerFeatures, EVCharger


def build_charger_features(ch: EVCharger) -> ChargerFeatures:
    """Infer features from charger API payload."""
    raw = ch.raw
    typ = str(raw.get("type") or raw.get("chargerType") or "").upper()
    is_dc = "DC" in typ or bool(raw.get("dcOnly") or raw.get("isDc"))
    max_c = _float_or_none(raw.get("maxCurrent") or raw.get("maxAmpere"))
    n_conn = len(ch.connectors) if ch.connectors else int(raw.get("numberOfConnectors") or 1)
    return ChargerFeatures(
        serial=ch.serial,
        is_dc=is_dc,
        supports_smart_mode=not is_dc,
        supports_current_limit=not is_dc,
        max_current_a=max_c,
        connector_count=max(1, n_conn),
    )


def merge_charger_features(prev: dict[str, ChargerFeatures], chargers: list[EVCharger]) -> dict[str, ChargerFeatures]:
    """Merge persisted feature flags with freshly parsed chargers."""
    out: dict[str, ChargerFeatures] = {}
    for ch in chargers:
        new_f = build_charger_features(ch)
        old = prev.get(ch.serial)
        if old:
            if old.supports_availability_patch is not None:
                new_f.supports_availability_patch = old.supports_availability_patch
            if old.supports_led_brightness is not None:
                new_f.supports_led_brightness = old.supports_led_brightness
        out[ch.serial] = new_f
    return out


def _float_or_none(v: object) -> float | None:
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None
