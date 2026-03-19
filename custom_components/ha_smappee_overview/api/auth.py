"""OAuth2 token handling for Smappee API."""

from __future__ import annotations

import logging
import time
from typing import Any

import aiohttp

from ..const import API_BASE, OAUTH_TOKEN_PATH

_LOGGER = logging.getLogger(__name__)


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
    async with session.post(url, data=data) as resp:
        body = await resp.json(content_type=None)
        if resp.status != 200:
            _LOGGER.warning("Smappee token error: %s %s", resp.status, body)
            raise SmappeeAuthError(body.get("error_description", "token_failed"))
        return body


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
    async with session.post(url, data=data) as resp:
        body = await resp.json(content_type=None)
        if resp.status != 200:
            _LOGGER.warning("Smappee refresh error: %s", resp.status)
            raise SmappeeAuthError(body.get("error_description", "refresh_failed"))
        return body


def token_expires_at(body: dict[str, Any]) -> float:
    """Unix timestamp when access token expires (with small margin)."""
    expires_in = int(body.get("expires_in", 3600))
    return time.time() + expires_in - 120
