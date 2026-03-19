"""Async Smappee API client."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Callable, Coroutine

import aiohttp

from ..const import (
    API_BASE,
    API_V2,
    API_V3,
    HTTP_GET_MAX_ATTEMPTS,
    HTTP_RETRY_BACKOFF_BASE_S,
    HTTP_RETRY_BACKOFF_MAX_S,
    HTTP_TIMEOUT_CONNECT,
    HTTP_TIMEOUT_TOTAL,
)
from . import auth
from .endpoints import (
    parse_alerts_payload,
    parse_charging_sessions,
    parse_consumption_summary,
    parse_ev_charger,
    parse_installations,
    parse_tariffs_payload,
    servicelocations_url,
)
from ..models import (
    AlertItem,
    ChargingSession,
    ConsumptionSummary,
    EVCharger,
    Installation,
    TariffInfo,
)

_LOGGER = logging.getLogger(__name__)


class SmappeeApiError(Exception):
    """Non-auth API error."""

    def __init__(
        self, message: str, *, retry_after_s: float | None = None
    ) -> None:
        super().__init__(message)
        self.retry_after_s = retry_after_s


def _api_error_is_transient_retryable(err: SmappeeApiError) -> bool:
    msg = str(err)
    return any(x in msg for x in ("http_429", "http_503", "http_502", "http_504"))


class SmappeeAPIClient:
    """HTTP client with token refresh."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        client_id: str,
        client_secret: str,
        access_token: str,
        refresh_token_value: str,
        token_expires_at: float,
        on_token_update: Callable[[dict[str, Any]], Coroutine[Any, Any, None]] | None = None,
    ) -> None:
        self._session = session
        self._client_id = client_id
        self._client_secret = client_secret
        self._access_token = access_token
        self._refresh_token = refresh_token_value
        self._expires_at = token_expires_at
        self._on_token_update = on_token_update
        self._timeout = aiohttp.ClientTimeout(
            total=HTTP_TIMEOUT_TOTAL,
            connect=HTTP_TIMEOUT_CONNECT,
        )

    @property
    def access_token(self) -> str:
        return self._access_token

    async def _ensure_token(self) -> None:
        if time.time() < self._expires_at:
            return
        body = await auth.refresh_token(
            self._session,
            self._client_id,
            self._client_secret,
            self._refresh_token,
        )
        self._apply_token_body(body)

    def _apply_token_body(self, body: dict[str, Any]) -> None:
        self._access_token = str(body["access_token"])
        if body.get("refresh_token"):
            self._refresh_token = str(body["refresh_token"])
        self._expires_at = auth.token_expires_at(body)

    async def _sleep_backoff(self, attempt: int, retry_after_s: float | None) -> None:
        if retry_after_s is not None and retry_after_s > 0:
            await asyncio.sleep(min(retry_after_s, 60.0))
            return
        delay = min(
            HTTP_RETRY_BACKOFF_BASE_S * (2**attempt),
            HTTP_RETRY_BACKOFF_MAX_S,
        )
        await asyncio.sleep(delay)

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        """HTTP request. Retries idempotent GETs on transient errors only."""
        method_u = method.upper()
        allow_retry = method_u == "GET"
        max_attempts = HTTP_GET_MAX_ATTEMPTS if allow_retry else 1
        last_err: BaseException | None = None

        for attempt in range(max_attempts):
            try:
                return await self._request_once(
                    method_u, path, json_body=json_body, params=params
                )
            except auth.SmappeeAuthError:
                raise
            except SmappeeApiError as err:
                last_err = err
                if not allow_retry or not _api_error_is_transient_retryable(err):
                    raise
                ra = err.retry_after_s
                _LOGGER.debug(
                    "Smappee GET retry attempt=%s path=%s err=%s",
                    attempt + 1,
                    path,
                    err,
                )
                await self._sleep_backoff(attempt, ra)
            except (TimeoutError, aiohttp.ClientError) as err:
                last_err = err
                if not allow_retry:
                    raise SmappeeApiError(f"network_{type(err).__name__}") from err
                _LOGGER.debug(
                    "Smappee GET network retry attempt=%s path=%s err=%s",
                    attempt + 1,
                    path,
                    err,
                )
                await self._sleep_backoff(attempt, None)

        if last_err is not None:
            if isinstance(last_err, SmappeeApiError):
                raise last_err
            raise SmappeeApiError(f"network_{type(last_err).__name__}") from last_err
        raise SmappeeApiError("request_failed")

    async def _request_once(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        await self._ensure_token()
        url = f"{API_BASE}{path}" if path.startswith("/") else f"{API_BASE}/{path}"
        headers = {"Authorization": f"Bearer {self._access_token}"}
        async with self._session.request(
            method,
            url,
            headers=headers,
            json=json_body,
            params=params,
            timeout=self._timeout,
        ) as resp:
            if resp.status == 401:
                body = await auth.refresh_token(
                    self._session,
                    self._client_id,
                    self._client_secret,
                    self._refresh_token,
                )
                self._apply_token_body(body)
                if self._on_token_update:
                    await self._on_token_update(
                        {
                            "access_token": self._access_token,
                            "refresh_token": self._refresh_token,
                            "token_expires_at": self._expires_at,
                        }
                    )
                headers["Authorization"] = f"Bearer {self._access_token}"
                async with self._session.request(
                    method,
                    url,
                    headers=headers,
                    json=json_body,
                    params=params,
                    timeout=self._timeout,
                ) as resp2:
                    return await self._parse_response(resp2)
            return await self._parse_response(resp)

    async def _parse_response(self, resp: aiohttp.ClientResponse) -> Any:
        if resp.status >= 400:
            await resp.read()  # drain
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug(
                    "Smappee API error method=%s url=%s status=%s",
                    resp.method,
                    str(resp.url).split("?", 1)[0],
                    resp.status,
                )
            ra_hdr = resp.headers.get("Retry-After")
            retry_after: float | None = None
            if ra_hdr:
                try:
                    retry_after = float(ra_hdr)
                except ValueError:
                    retry_after = None
            raise SmappeeApiError(
                f"http_{resp.status}", retry_after_s=retry_after
            )

        ctype = resp.headers.get("Content-Type", "")
        if "application/json" in ctype:
            return await resp.json()
        return await resp.text()

    async def get_servicelocations(self) -> list[Installation]:
        data = await self._request("GET", servicelocations_url())
        if isinstance(data, list):
            return parse_installations(data)
        if isinstance(data, dict):
            return parse_installations(data)
        return []

    async def get_servicelocation_detail(
        self, service_location_id: int
    ) -> dict[str, Any] | None:
        """Single service location with extended fields (e.g. devices[]); None if unavailable."""
        path = f"{API_V2}/servicelocation/{service_location_id}"
        try:
            data = await self._request(
                "GET", path, params={"extendedMode": "1"}
            )
        except SmappeeApiError as err:
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug("Service location detail failed: %s", err)
            return None
        return data if isinstance(data, dict) else None

    async def get_realtime_consumption(self, service_location_id: int) -> ConsumptionSummary:
        """Fetch latest consumption; path may vary — use aggregated endpoint."""
        stale = False
        raw: dict[str, Any] = {}
        try:
            path = f"{API_V2}/servicelocation/{service_location_id}/instantaneous"
            data = await self._request("GET", path)
            if isinstance(data, dict):
                raw = data
        except SmappeeApiError:
            try:
                path = f"{API_V2}/servicelocation/{service_location_id}/consumption"
                data = await self._request(
                    "GET",
                    path,
                    params={"aggregation": 1, "from": 0, "to": 9999999999999},
                )
                if isinstance(data, dict):
                    raw = data
            except SmappeeApiError:
                stale = True
        if not raw:
            stale = True
        return parse_consumption_summary(raw, stale=stale)

    async def list_charging_stations(self, service_location_id: int) -> list[EVCharger]:
        """Discover chargers for location (best-effort)."""
        chargers: list[EVCharger] = []
        try:
            path = f"{API_V3}/servicelocation/{service_location_id}/chargingstations"
            data = await self._request("GET", path)
            rows = (
                data
                if isinstance(data, list)
                else data.get("chargingStations", [])
                if isinstance(data, dict)
                else []
            )
            for row in rows:
                if isinstance(row, dict):
                    chargers.append(parse_ev_charger(row))
        except (SmappeeApiError, KeyError, TypeError) as err:
            _LOGGER.debug("Charging stations list failed: %s", err)
        return chargers

    async def get_charging_sessions(
        self,
        charging_park_id_or_serial: str,
        from_ms: int,
        to_ms: int,
        *,
        service_location_id: int | None = None,
        charging_park_id: int | None = None,
    ) -> list[ChargingSession]:
        serial = charging_park_id_or_serial
        sessions: list[ChargingSession] = []
        try:
            path = f"{API_V3}/chargingstations/{serial}/sessions"
            data = await self._request(
                "GET",
                path,
                params={"from": from_ms, "to": to_ms},
            )
            sessions = parse_charging_sessions(
                data if isinstance(data, (list, dict)) else {}, serial
            )
        except SmappeeApiError:
            pass
        park_id = (
            charging_park_id
            if charging_park_id is not None
            else service_location_id
        )
        if not sessions and park_id is not None:
            try:
                path = f"{API_V3}/chargingparks/{park_id}/sessions"
                data = await self._request(
                    "GET",
                    path,
                    params={"range": f"{from_ms},{to_ms}"},
                )
                sessions = parse_charging_sessions(
                    data if isinstance(data, (list, dict)) else {}, serial
                )
            except SmappeeApiError:
                pass
        return sessions

    async def get_tariffs(self, service_location_id: int) -> tuple[list[TariffInfo], bool]:
        """Return (tariffs, endpoint_reached)."""
        for path in (
            f"{API_V2}/servicelocation/{service_location_id}/tariffs",
            f"{API_V3}/servicelocation/{service_location_id}/tariff",
        ):
            try:
                data = await self._request("GET", path)
            except SmappeeApiError as err:
                if "http_404" in str(err):
                    continue
                return [], False
            return parse_tariffs_payload(data), True
        return [], False

    async def get_alerts(self, service_location_id: int) -> tuple[list[AlertItem], bool]:
        for path in (
            f"{API_V2}/servicelocation/{service_location_id}/alerts",
            f"{API_V2}/servicelocation/{service_location_id}/notifications",
        ):
            try:
                data = await self._request("GET", path)
            except SmappeeApiError as err:
                if "http_404" in str(err):
                    continue
                return [], False
            return parse_alerts_payload(data), True
        return [], False

    async def set_connector_mode(
        self,
        station_serial: str,
        connector_position: int,
        mode: str,
        *,
        limit_percent: int | None = None,
        current_a: float | None = None,
    ) -> None:
        path = f"{API_V3}/chargingstations/{station_serial}/connectors/{connector_position}/mode"
        body: dict[str, Any] = {"mode": mode}
        if mode == "NORMAL" and (limit_percent is not None or current_a is not None):
            if current_a is not None:
                body["limit"] = {"unit": "AMPERE", "value": current_a}
            elif limit_percent is not None:
                body["limit"] = {"unit": "PERCENTAGE", "value": limit_percent}
        await self._request("PUT", path, json_body=body)

    async def set_led_brightness(self, station_serial: str, brightness_pct: int) -> None:
        path = f"{API_V3}/chargingstations/{station_serial}"
        await self._request("PATCH", path, json_body={"ledBrightness": brightness_pct})

    async def set_charger_availability(self, station_serial: str, available: bool) -> bool:
        """PATCH station availability. Returns False if API rejects (unsupported)."""
        path = f"{API_V3}/chargingstations/{station_serial}"
        try:
            await self._request(
                "PATCH", path, json_body={"available": available}
            )
        except SmappeeApiError as err:
            msg = str(err)
            if any(x in msg for x in ("http_400", "http_404", "http_405")):
                return False
            raise
        return True
