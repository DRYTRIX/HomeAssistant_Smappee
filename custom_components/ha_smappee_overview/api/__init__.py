"""Smappee API package.

Submodules like :mod:`endpoints` are importable without loading the HTTP
client (avoids requiring aiohttp for parsing-only tests). Public symbols are
loaded on demand.
"""

from __future__ import annotations

import importlib
from typing import Any

__all__ = [
    "SmappeeDomainAPI",
    "SmappeeAPIClient",
    "SmappeeApiError",
    "SmappeeAuthError",
    "fetch_token_password",
    "refresh_token",
    "token_expires_at",
]

_LAZY_EXPORTS: dict[str, tuple[str, str]] = {
    "SmappeeAuthError": (".auth", "SmappeeAuthError"),
    "fetch_token_password": (".auth", "fetch_token_password"),
    "refresh_token": (".auth", "refresh_token"),
    "token_expires_at": (".auth", "token_expires_at"),
    "SmappeeAPIClient": (".client", "SmappeeAPIClient"),
    "SmappeeApiError": (".client", "SmappeeApiError"),
    "SmappeeDomainAPI": (".facade", "SmappeeDomainAPI"),
}


def __getattr__(name: str) -> Any:
    if name in _LAZY_EXPORTS:
        submodule, attr = _LAZY_EXPORTS[name]
        mod = importlib.import_module(submodule, __package__)
        return getattr(mod, attr)
    msg = f"module {__name__!r} has no attribute {name!r}"
    raise AttributeError(msg)


def __dir__() -> list[str]:
    return sorted(__all__)
