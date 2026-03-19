"""OAuth2 token handling for Smappee API."""

from __future__ import annotations

import logging
import time
from typing import Any

import aiohttp

from ..const import (
    API_BASE,
    HTTP_TIMEOUT_CONNECT,
    HTTP_TIMEOUT_TOTAL,
    OAUTH_TOKEN_PATH,
)
from .contracts import ContractValidationError, OAuthTokenContract, parse_contract

_LOGGER = logging.getLogger(__name__)

_OAUTH_TIMEOUT = aiohttp.ClientTimeout(
    total=HTTP_TIMEOUT_TOTAL,
    connect=HTTP_TIMEOUT_CONNECT,
)


def _oauth_error_summary(body: Any) -> str:
    """Log-safe summary (never log full token responses)."""
    if not isinstance(body, dict):
        return "invalid_body"
    err = body.get("error")
    if err is not None:
        return str(err)
    desc = body.get("error_description")
    if isinstance(desc, str) and desc:
        # Strip possible PII from descriptions
        return "error_description_present" if len(desc) > 80 else desc[:80]
    return "unknown_error"


class SmappeeAuthError(Exception):
    """Authentication failed."""


async def fetch_token_password(
    session: aiohttp.ClientSession,
    client_id: str,
    client_secret: str,
    username: str,
    password: str,
) -> dict[str, Any]:
    """Obtain tokens using password grant."""
    url = f"{API_BASE}{OAUTH_TOKEN_PATH}"
    data = {
        "grant_type": "password",
        "client_id": client_id,
        "client_secret": client_secret,
        "username": username,
        "password": password,
    }
    async with session.post(url, data=data, timeout=_OAUTH_TIMEOUT) as resp:
        try:
            body = await resp.json(content_type=None)
        except Exception as err:
            raise SmappeeAuthError("token_invalid_json") from err
        if resp.status != 200:
            _LOGGER.warning(
                "Smappee token error: http_status=%s summary=%s",
                resp.status,
                _oauth_error_summary(body),
            )
            raise SmappeeAuthError(
                body.get("error_description", "token_failed")
                if isinstance(body, dict)
                else "token_failed"
            )
        try:
            contract = parse_contract(OAuthTokenContract, body)
        except ContractValidationError as err:
            raise SmappeeAuthError("token_invalid_payload") from err
        return contract.model_dump(exclude_none=True)


async def refresh_token(
    session: aiohttp.ClientSession,
    client_id: str,
    client_secret: str,
    refresh_token_value: str,
) -> dict[str, Any]:
    """Refresh access token."""
    url = f"{API_BASE}{OAUTH_TOKEN_PATH}"
    data = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token_value,
    }
    async with session.post(url, data=data, timeout=_OAUTH_TIMEOUT) as resp:
        try:
            body = await resp.json(content_type=None)
        except Exception as err:
            raise SmappeeAuthError("refresh_invalid_json") from err
        if resp.status != 200:
            _LOGGER.warning(
                "Smappee refresh error: http_status=%s summary=%s",
                resp.status,
                _oauth_error_summary(body),
            )
            raise SmappeeAuthError(
                body.get("error_description", "refresh_failed")
                if isinstance(body, dict)
                else "refresh_failed"
            )
        try:
            contract = parse_contract(OAuthTokenContract, body)
        except ContractValidationError as err:
            raise SmappeeAuthError("refresh_invalid_payload") from err
        return contract.model_dump(exclude_none=True)


def token_expires_at(body: dict[str, Any]) -> float:
    """Unix timestamp when access token expires (with small margin)."""
    expires_in = int(body.get("expires_in", 3600))
    return time.time() + expires_in - 120
