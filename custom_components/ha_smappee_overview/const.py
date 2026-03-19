"""Constants for ha_smappee_overview."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "ha_smappee_overview"

# Config entry keys
CONF_CLIENT_ID: Final = "client_id"
CONF_CLIENT_SECRET: Final = "client_secret"
CONF_ACCESS_TOKEN: Final = "access_token"
CONF_REFRESH_TOKEN: Final = "refresh_token"
CONF_TOKEN_EXPIRES_AT: Final = "token_expires_at"
CONF_SERVICE_LOCATION_ID: Final = "service_location_id"
CONF_SERVICE_LOCATION_NAME: Final = "service_location_name"
CONF_USERNAME: Final = "username"

# Options
CONF_UPDATE_INTERVAL: Final = "update_interval"
CONF_COUNTRY_CODE: Final = "country_code"
DEFAULT_UPDATE_INTERVAL: Final = 60
MAX_SESSION_POLL_CHARGERS: Final = 5
CONF_SESSION_HISTORY_DAYS: Final = "session_history_days"
CONF_MAX_SESSION_CHARGERS: Final = "max_session_chargers"
CONF_CHARGING_PARK_ID_OVERRIDE: Final = "charging_park_id_override"
CONF_DEBUG_SESSION_JSON_KEYS: Final = "debug_session_json_keys"
DEFAULT_SESSION_HISTORY_DAYS: Final = 7

# API
API_BASE: Final = "https://app1pub.smappee.net"
OAUTH_TOKEN_PATH: Final = "/dev/v1/oauth2/token"
API_V2: Final = "/dev/v2"
API_V3: Final = "/dev/v3"

# Charging modes (API-facing)
CHARGING_MODE_NORMAL: Final = "NORMAL"
CHARGING_MODE_SMART: Final = "SMART"
CHARGING_MODE_PAUSED: Final = "PAUSED"

# User-facing mode aliases (services)
MODE_STANDARD: Final = "standard"
MODE_SMART: Final = "smart"
MODE_SOLAR: Final = "solar"

# Static HTTP path (must match manifest / registration)
STATIC_URL_PATH: Final = "/api/ha_smappee_overview/static"

# hass.data layout
DATA_CLIENT: Final = "client"
DATA_COORDINATOR: Final = "coordinator"
DATA_PANEL_REGISTERED: Final = "panel_registered"
DATA_WEBSOCKET_CMD: Final = "websocket_cmd_registered"

# WebSocket
WS_TYPE_PANEL_DATA: Final = f"{DOMAIN}/get_panel_data"
WS_TYPE_LIST_ENTRIES: Final = f"{DOMAIN}/list_entries"
