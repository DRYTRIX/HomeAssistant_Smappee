"""Config flow for Smappee Overview."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import aiohttp_client, config_validation as cv

from .api import SmappeeAuthError, fetch_token_password, token_expires_at
from .api import SmappeeDomainAPI
from .api.client import SmappeeAPIClient
from .const import (
    CONF_ACCESS_TOKEN,
    CONF_CHARGING_PARK_ID_OVERRIDE,
    CONF_CLIENT_ID,
    CONF_CLIENT_SECRET,
    CONF_COUNTRY_CODE,
    CONF_DEBUG_SESSION_JSON_KEYS,
    CONF_MAX_SESSION_CHARGERS,
    CONF_REFRESH_TOKEN,
    CONF_SERVICE_LOCATION_ID,
    CONF_SERVICE_LOCATION_NAME,
    CONF_SESSION_HISTORY_DAYS,
    CONF_TOKEN_EXPIRES_AT,
    CONF_USERNAME,
    CONF_UPDATE_INTERVAL,
    DEFAULT_SESSION_HISTORY_DAYS,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    MAX_SESSION_POLL_CHARGERS,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CLIENT_ID): str,
        vol.Required(CONF_CLIENT_SECRET): str,
        vol.Required(CONF_USERNAME): str,
        vol.Required("password"): str,
    }
)

STEP_LOCATION_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SERVICE_LOCATION_ID): vol.Coerce(int),
    }
)


async def _get_session(hass: HomeAssistant) -> aiohttp.ClientSession:
    return aiohttp_client.async_get_clientsession(hass)


class SmappeeOverviewConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle config and reauth."""

    VERSION = 1

    def __init__(self) -> None:
        self._token_data: dict[str, Any] = {}
        self._creds: dict[str, str] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """OAuth credentials + Smappee account login."""
        errors: dict[str, str] = {}
        if user_input is not None:
            session = await _get_session(self.hass)
            try:
                body = await fetch_token_password(
                    session,
                    user_input[CONF_CLIENT_ID],
                    user_input[CONF_CLIENT_SECRET],
                    user_input[CONF_USERNAME],
                    user_input["password"],
                )
            except SmappeeAuthError:
                errors["base"] = "invalid_auth"
            except aiohttp.ClientError:
                errors["base"] = "cannot_connect"
            else:
                self._token_data = {
                    CONF_ACCESS_TOKEN: body["access_token"],
                    CONF_REFRESH_TOKEN: body.get("refresh_token", ""),
                    CONF_TOKEN_EXPIRES_AT: token_expires_at(body),
                }
                self._creds = {
                    CONF_CLIENT_ID: user_input[CONF_CLIENT_ID],
                    CONF_CLIENT_SECRET: user_input[CONF_CLIENT_SECRET],
                    CONF_USERNAME: user_input[CONF_USERNAME],
                }
                return await self.async_step_location()

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_SCHEMA,
            errors=errors,
        )

    async def async_step_location(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick service location."""
        errors: dict[str, str] = {}
        session = await _get_session(self.hass)
        client = SmappeeAPIClient(
            session,
            self._creds[CONF_CLIENT_ID],
            self._creds[CONF_CLIENT_SECRET],
            self._token_data[CONF_ACCESS_TOKEN],
            self._token_data[CONF_REFRESH_TOKEN],
            self._token_data[CONF_TOKEN_EXPIRES_AT],
        )
        api = SmappeeDomainAPI(client)
        if user_input is not None:
            loc_id = user_input[CONF_SERVICE_LOCATION_ID]
            locations = await api.list_service_locations()
            loc = next((l for l in locations if l.id == loc_id), None)
            name = loc.name if loc else f"Location {loc_id}"
            await self.async_set_unique_id(f"{DOMAIN}_{loc_id}")
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=name,
                data={
                    **self._creds,
                    **self._token_data,
                    CONF_SERVICE_LOCATION_ID: loc_id,
                    CONF_SERVICE_LOCATION_NAME: name,
                },
            )

        try:
            locations = await api.list_service_locations()
        except SmappeeAuthError:
            return await self.async_step_user()
        except aiohttp.ClientError:
            errors["base"] = "cannot_connect"
            locations = []

        if not locations:
            return self.async_show_form(
                step_id="location",
                data_schema=vol.Schema(
                    {
                        vol.Required(
                            CONF_SERVICE_LOCATION_ID,
                            description="Service location ID (from Smappee app if list is empty)",
                        ): vol.Coerce(int),
                    }
                ),
                errors=errors or {"base": "no_locations"},
            )

        return self.async_show_form(
            step_id="location",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SERVICE_LOCATION_ID): vol.In(
                        {loc.id: f"{loc.name} ({loc.id})" for loc in locations}
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> ConfigFlowResult:
        """Re-authenticate when token refresh fails."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm reauth."""
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()
        if user_input is not None:
            session = await _get_session(self.hass)
            try:
                body = await fetch_token_password(
                    session,
                    entry.data[CONF_CLIENT_ID],
                    entry.data[CONF_CLIENT_SECRET],
                    user_input[CONF_USERNAME],
                    user_input["password"],
                )
            except SmappeeAuthError:
                errors["base"] = "invalid_auth"
            except aiohttp.ClientError:
                errors["base"] = "cannot_connect"
            else:
                new_data = {
                    **entry.data,
                    CONF_ACCESS_TOKEN: body["access_token"],
                    CONF_REFRESH_TOKEN: body.get("refresh_token", entry.data.get(CONF_REFRESH_TOKEN, "")),
                    CONF_TOKEN_EXPIRES_AT: token_expires_at(body),
                }
                return self.async_update_reload_and_abort(
                    entry,
                    data_updates=new_data,
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_USERNAME, default=entry.data.get(CONF_USERNAME, "")): str,
                vol.Required("password"): str,
            }
        )
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=schema,
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Update options and optionally refresh credentials."""
        errors: dict[str, str] = {}
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            opts = {
                CONF_UPDATE_INTERVAL: int(
                    user_input.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL)
                ),
                CONF_SESSION_HISTORY_DAYS: int(
                    user_input.get(CONF_SESSION_HISTORY_DAYS, DEFAULT_SESSION_HISTORY_DAYS)
                ),
                CONF_MAX_SESSION_CHARGERS: int(
                    user_input.get(CONF_MAX_SESSION_CHARGERS, MAX_SESSION_POLL_CHARGERS)
                ),
                CONF_CHARGING_PARK_ID_OVERRIDE: user_input.get(
                    CONF_CHARGING_PARK_ID_OVERRIDE
                ),
                CONF_DEBUG_SESSION_JSON_KEYS: user_input.get(
                    CONF_DEBUG_SESSION_JSON_KEYS, False
                ),
                "reimbursement_rate_per_kwh": float(
                    user_input.get("reimbursement_rate_per_kwh", 0) or 0
                ),
                "reimbursement_currency": user_input.get("reimbursement_currency", "EUR"),
                "belgium_cap_eur_per_kwh": user_input.get("belgium_cap_eur_per_kwh"),
                CONF_COUNTRY_CODE: (user_input.get(CONF_COUNTRY_CODE) or "") or None,
            }
            data_updates: dict[str, Any] = {}
            pwd = user_input.get("password")
            if pwd:
                session = await _get_session(self.hass)
                try:
                    body = await fetch_token_password(
                        session,
                        entry.data[CONF_CLIENT_ID],
                        entry.data[CONF_CLIENT_SECRET],
                        entry.data.get(CONF_USERNAME, ""),
                        pwd,
                    )
                    data_updates = {
                        CONF_ACCESS_TOKEN: body["access_token"],
                        CONF_REFRESH_TOKEN: body.get(
                            CONF_REFRESH_TOKEN, entry.data.get(CONF_REFRESH_TOKEN, "")
                        ),
                        CONF_TOKEN_EXPIRES_AT: token_expires_at(body),
                    }
                except SmappeeAuthError:
                    errors["base"] = "invalid_auth"
                except aiohttp.ClientError:
                    errors["base"] = "cannot_connect"
            if not errors:
                kwargs: dict[str, Any] = {"options_updates": opts}
                if data_updates:
                    kwargs["data_updates"] = data_updates
                return self.async_update_reload_and_abort(entry, **kwargs)

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_UPDATE_INTERVAL,
                        default=entry.options.get(
                            CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=30, max=3600)),
                    vol.Optional(
                        CONF_SESSION_HISTORY_DAYS,
                        default=entry.options.get(
                            CONF_SESSION_HISTORY_DAYS, DEFAULT_SESSION_HISTORY_DAYS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=90)),
                    vol.Optional(
                        CONF_MAX_SESSION_CHARGERS,
                        default=entry.options.get(
                            CONF_MAX_SESSION_CHARGERS, MAX_SESSION_POLL_CHARGERS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=20)),
                    vol.Optional(
                        CONF_CHARGING_PARK_ID_OVERRIDE,
                        default=entry.options.get(CONF_CHARGING_PARK_ID_OVERRIDE),
                    ): vol.Any(None, vol.Coerce(int)),
                    vol.Optional(
                        CONF_DEBUG_SESSION_JSON_KEYS,
                        default=entry.options.get(CONF_DEBUG_SESSION_JSON_KEYS, False),
                    ): cv.boolean,
                    vol.Optional(
                        "reimbursement_rate_per_kwh",
                        default=entry.options.get("reimbursement_rate_per_kwh", 0),
                    ): vol.Coerce(float),
                    vol.Optional(
                        "reimbursement_currency",
                        default=entry.options.get("reimbursement_currency", "EUR"),
                    ): str,
                    vol.Optional(
                        "belgium_cap_eur_per_kwh",
                        default=entry.options.get("belgium_cap_eur_per_kwh"),
                    ): vol.Any(None, vol.Coerce(float)),
                    vol.Optional(
                        CONF_COUNTRY_CODE,
                        default=entry.options.get(CONF_COUNTRY_CODE) or "",
                    ): vol.In(["", "BE", "NL", "DE", "FR", "OTHER"]),
                    vol.Optional("password"): str,
                }
            ),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Options flow."""
        return SmappeeOverviewOptionsFlow()


class SmappeeOverviewOptionsFlow(OptionsFlow):
    """Reconfigure polling and reimbursement."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self.config_entry
        if user_input is not None:
            merged = {**dict(entry.options), **user_input}
            return self.async_create_entry(title="", data=merged)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_UPDATE_INTERVAL,
                        default=entry.options.get(
                            CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=30, max=3600)),
                    vol.Optional(
                        CONF_SESSION_HISTORY_DAYS,
                        default=entry.options.get(
                            CONF_SESSION_HISTORY_DAYS, DEFAULT_SESSION_HISTORY_DAYS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=90)),
                    vol.Optional(
                        CONF_MAX_SESSION_CHARGERS,
                        default=entry.options.get(
                            CONF_MAX_SESSION_CHARGERS, MAX_SESSION_POLL_CHARGERS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=20)),
                    vol.Optional(
                        CONF_CHARGING_PARK_ID_OVERRIDE,
                        default=entry.options.get(CONF_CHARGING_PARK_ID_OVERRIDE),
                    ): vol.Any(None, vol.Coerce(int)),
                    vol.Optional(
                        CONF_DEBUG_SESSION_JSON_KEYS,
                        default=entry.options.get(CONF_DEBUG_SESSION_JSON_KEYS, False),
                    ): cv.boolean,
                    vol.Optional(
                        "reimbursement_rate_per_kwh",
                        default=entry.options.get("reimbursement_rate_per_kwh", 0),
                    ): vol.Coerce(float),
                    vol.Optional(
                        "reimbursement_currency",
                        default=entry.options.get("reimbursement_currency", "EUR"),
                    ): str,
                    vol.Optional(
                        "belgium_cap_eur_per_kwh",
                        default=entry.options.get("belgium_cap_eur_per_kwh"),
                    ): vol.Any(None, vol.Coerce(float)),
                    vol.Optional(
                        CONF_COUNTRY_CODE,
                        default=entry.options.get(CONF_COUNTRY_CODE) or "",
                    ): vol.In(["", "BE", "NL", "DE", "FR", "OTHER"]),
                }
            ),
        )


