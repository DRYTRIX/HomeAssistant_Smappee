"""Panel cache helper behavior."""

from __future__ import annotations

import time

from ha_smappee_overview.integration import _attach_freshness, _payload_has_substantive_data


def test_payload_has_substantive_data_false_for_empty() -> None:
    assert _payload_has_substantive_data({}) is False


def test_payload_has_substantive_data_true_for_consumption() -> None:
    assert (
        _payload_has_substantive_data({"consumption": {"grid_import_w": 100.0}})
        is True
    )


def test_attach_freshness_fields_present() -> None:
    ts = time.time() - 1.0
    out = _attach_freshness({"x": 1}, generated_at_ts=ts, from_cache=True)
    assert out["x"] == 1
    assert out["from_cache"] is True
    assert isinstance(out["cache_age_s"], float)
    assert isinstance(out["generated_at_utc"], str)
