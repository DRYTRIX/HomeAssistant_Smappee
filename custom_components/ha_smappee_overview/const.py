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
# Discovery health: mark stale if not seen for N coordinator polls (heuristic).
DISCOVERY_STALE_POLL_MULTIPLIER: Final = 3
MAX_SESSION_POLL_CHARGERS: Final = 5
CONF_SESSION_HISTORY_DAYS: Final = "session_history_days"
CONF_MAX_SESSION_CHARGERS: Final = "max_session_chargers"
CONF_CHARGING_PARK_ID_OVERRIDE: Final = "charging_park_id_override"
CONF_DEBUG_SESSION_JSON_KEYS: Final = "debug_session_json_keys"
CONF_ADVANCED_PANEL: Final = "advanced_panel"
CONF_PEAK_PHASE_CURRENT_WARNING_A: Final = "peak_phase_current_warning_a"
CONF_ASSISTANT_OFF_PEAK_PRICE_PER_KWH: Final = "assistant_off_peak_price_per_kwh"
CONF_ASSISTANT_ASSUMED_SESSION_KWH: Final = "assistant_assumed_session_kwh"
DEFAULT_SESSION_HISTORY_DAYS: Final = 7
DEFAULT_ASSISTANT_ASSUMED_SESSION_KWH: Final = 10

# Energy intelligence / Belgium capacity proxy
CONF_EI_LINE_VOLTAGE: Final = "ei_line_voltage"
CONF_EI_CHARGE_PHASES: Final = "ei_charge_phases"
CONF_EI_ENABLE_CAPACITY_TRACKING: Final = "ei_enable_capacity_tracking"
CONF_BE_CAPACITY_CONTRACT_KW: Final = "be_capacity_contract_kw"
CONF_BE_CAPACITY_WARN_PCT: Final = "be_capacity_warn_pct"
CONF_BE_CAPACITY_EUR_PER_KW_YEAR: Final = "be_capacity_eur_per_kw_year"
DEFAULT_EI_LINE_VOLTAGE: Final = 230.0
DEFAULT_EI_CHARGE_PHASES: Final = 1
DEFAULT_BE_CAPACITY_WARN_PCT: Final = 80.0

# API
API_BASE: Final = "https://app1pub.smappee.net"
OAUTH_TOKEN_PATH: Final = "/dev/v1/oauth2/token"
API_V2: Final = "/dev/v2"
API_V3: Final = "/dev/v3"

# HTTP client (aiohttp)
HTTP_TIMEOUT_TOTAL: Final = 45
HTTP_TIMEOUT_CONNECT: Final = 10
# Idempotent GET retries (transient errors only; writes are never retried here)
HTTP_GET_MAX_ATTEMPTS: Final = 4
HTTP_RETRY_BACKOFF_BASE_S: Final = 0.5
HTTP_RETRY_BACKOFF_MAX_S: Final = 8.0

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
