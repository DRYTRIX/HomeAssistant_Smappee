"""Mock mode data builders."""

from __future__ import annotations

from datetime import UTC, datetime

from ha_smappee_overview.mock_data import (
    build_mock_chargers,
    build_mock_consumption,
    build_mock_installation,
    build_mock_reimbursement,
    build_mock_sessions,
    build_mock_tariffs,
)


def test_mock_data_shapes() -> None:
    now = datetime.now(UTC)
    inst = build_mock_installation(123)
    cons = build_mock_consumption(now)
    chargers = build_mock_chargers(now)
    sessions_active, sessions_recent = build_mock_sessions(now)
    tariffs = build_mock_tariffs()
    reim = build_mock_reimbursement()

    assert inst.id == 123
    assert cons.timestamp.tzinfo is not None
    assert len(chargers) == 1
    assert len(sessions_active) == 1
    assert len(sessions_recent) == 1
    assert len(tariffs) == 1
    assert reim.rate_per_kwh > 0
