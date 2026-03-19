"""SmappeeAPIClient behavior with mocked aiohttp session."""

from __future__ import annotations

import asyncio
import time
from unittest.mock import AsyncMock, MagicMock

import pytest

from ha_smappee_overview.api.client import SmappeeAPIClient, SmappeeApiError


def _ctx_for_response(resp: MagicMock) -> MagicMock:
    ctx = MagicMock()
    ctx.__aenter__ = AsyncMock(return_value=resp)
    ctx.__aexit__ = AsyncMock(return_value=False)
    return ctx


def _ok_json_response(payload: list | dict) -> MagicMock:
    r = MagicMock()
    r.status = 200
    r.method = "GET"
    r.url = "https://app1pub.smappee.net/dev/v2/servicelocation"
    r.headers = {"Content-Type": "application/json"}
    r.json = AsyncMock(return_value=payload)
    return r


def _error_response(status: int, *, retry_after: str | None = None) -> MagicMock:
    r = MagicMock()
    r.status = status
    r.method = "GET"
    r.url = "https://app1pub.smappee.net/x"
    hdrs: dict[str, str] = {}
    if retry_after is not None:
        hdrs["Retry-After"] = retry_after
    r.headers = hdrs
    r.read = AsyncMock()
    return r


@pytest.fixture
def future_token_expiry() -> float:
    return time.time() + 10_000.0


def test_smappee_api_error_retry_after() -> None:
    err = SmappeeApiError("http_429", retry_after_s=2.5)
    assert err.retry_after_s == 2.5


def test_get_servicelocations_success(future_token_expiry: float) -> None:
    async def run() -> None:
        payload = [{"serviceLocationId": 99, "name": "Test"}]
        resp = _ok_json_response(payload)
        session = MagicMock()
        session.request = MagicMock(return_value=_ctx_for_response(resp))
        client = SmappeeAPIClient(
            session,
            "cid",
            "csec",
            "atok",
            "rtok",
            future_token_expiry,
        )
        locs = await client.get_servicelocations()
        assert len(locs) == 1
        assert locs[0].id == 99
        assert locs[0].name == "Test"
        session.request.assert_called_once()

    asyncio.run(run())


def test_get_retries_transient_503_then_success(future_token_expiry: float) -> None:
    async def run() -> None:
        bad = _error_response(503)
        good = _ok_json_response([{"serviceLocationId": 1, "name": "A"}])
        session = MagicMock()
        session.request = MagicMock(
            side_effect=[
                _ctx_for_response(bad),
                _ctx_for_response(good),
            ]
        )
        client = SmappeeAPIClient(
            session,
            "cid",
            "csec",
            "atok",
            "rtok",
            future_token_expiry,
        )
        locs = await client.get_servicelocations()
        assert len(locs) == 1
        assert session.request.call_count == 2

    asyncio.run(run())


def test_put_no_retry_on_503(future_token_expiry: float) -> None:
    async def run() -> None:
        bad = _error_response(503)
        session = MagicMock()
        session.request = MagicMock(return_value=_ctx_for_response(bad))
        client = SmappeeAPIClient(
            session,
            "cid",
            "csec",
            "atok",
            "rtok",
            future_token_expiry,
        )
        with pytest.raises(SmappeeApiError, match="http_503"):
            await client.set_connector_mode("SN", 1, "PAUSED")
        session.request.assert_called_once()

    asyncio.run(run())


def test_get_tariffs_raises_on_non_404(future_token_expiry: float) -> None:
    async def run() -> None:
        bad = _error_response(503)
        session = MagicMock()
        session.request = MagicMock(return_value=_ctx_for_response(bad))
        client = SmappeeAPIClient(
            session,
            "cid",
            "csec",
            "atok",
            "rtok",
            future_token_expiry,
        )
        with pytest.raises(SmappeeApiError, match="http_503"):
            await client.get_tariffs(1)

    asyncio.run(run())


def test_get_sessions_raises_when_both_endpoints_fail(future_token_expiry: float) -> None:
    async def run() -> None:
        bad_station = _error_response(503)
        bad_park = _error_response(503)
        session = MagicMock()
        # GET endpoints retry on transient errors; keep headroom so fallback
        # path/extra probes do not exhaust mocked responses.
        session.request = MagicMock(
            side_effect=[_ctx_for_response(bad_station)] * 8
            + [_ctx_for_response(bad_park)] * 8
        )
        client = SmappeeAPIClient(
            session,
            "cid",
            "csec",
            "atok",
            "rtok",
            future_token_expiry,
        )
        with pytest.raises(SmappeeApiError, match="http_503"):
            await client.get_charging_sessions(
                "SN",
                1,
                2,
                service_location_id=1,
            )

    asyncio.run(run())
