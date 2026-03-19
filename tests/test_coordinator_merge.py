"""Coordinator merge logic (no Home Assistant)."""

from __future__ import annotations

from ha_smappee_overview.coordinator_merge import build_charger_features, merge_charger_features
from ha_smappee_overview.models import ChargerFeatures, ConnectorState, EVCharger


def test_build_charger_features_dc() -> None:
    ch = EVCharger(
        serial="DC1",
        name="Ultra",
        raw={"type": "DC_FAST", "maxCurrent": 200},
    )
    f = build_charger_features(ch)
    assert f.is_dc is True
    assert f.supports_smart_mode is False
    assert f.supports_current_limit is False


def test_build_charger_features_ac() -> None:
    ch = EVCharger(
        serial="AC1",
        name="Wall",
        connectors=[ConnectorState(position=1)],
        raw={"maxCurrent": 32},
    )
    f = build_charger_features(ch)
    assert f.is_dc is False
    assert f.supports_smart_mode is True
    assert f.max_current_a == 32.0


def test_merge_preserves_availability_flag() -> None:
    ch = EVCharger(serial="S1", name="C1", connectors=[ConnectorState(position=1)])
    prev = {"S1": ChargerFeatures(serial="S1", supports_availability_patch=False)}
    out = merge_charger_features(prev, [ch])
    assert out["S1"].supports_availability_patch is False


def test_merge_preserves_led_flag() -> None:
    ch = EVCharger(serial="S1", name="C1")
    prev = {"S1": ChargerFeatures(serial="S1", supports_led_brightness=True)}
    out = merge_charger_features(prev, [ch])
    assert out["S1"].supports_led_brightness is True
