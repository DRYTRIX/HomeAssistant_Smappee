# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-03-19

### Added

- Overview widget templates (`default`, `operations`, `compact`) with persisted drag-and-drop ordering.
- Config/reconfigure support for `demo_mode` and a `test_connection_now` action.
- Backend health check WebSocket endpoint: `ha_smappee_overview/health_check`.
- Fallback/demo payload strategy so the dashboard remains populated when live telemetry is unavailable.

### Changed

- Panel fetch flow now throttles duplicate loads and de-duplicates history sparkline requests.
- Store updates now avoid notifying listeners when state patches do not change values.
- Responsive spacing and section-level styling were normalized for production UI consistency.

## [0.2.1] - 2026-03-19

### Fixed

- Sensor platform module: use `sensor.py` (not `sensors.py`) so Home Assistant can import `custom_components.ha_smappee_overview.sensor` and the config entry loads.

## [0.2.0] - 2026-03-19

### Added

- HTTP timeouts and bounded exponential backoff retries for **GET** requests (transient 429/503/502/504 and network errors). **PUT/PATCH** are not auto-retried.
- Coordinator methods for charger writes (`async_set_connector_mode`, `async_set_led_brightness`, `async_set_charger_availability`) as the single path for entities and services.
- Safer OAuth error logging (no full token error bodies in logs).
- Expanded diagnostics: `last_successful_update`, consumption stale flag, charger feature map, session counts, API health summary.
- Panel WebSocket payload validation and unified `callWS` usage.
- Tests: panel serialization, installation parser edge cases, mocked API client (retry / no-retry on writes), discovery, energy intelligence, charging explanation, assistant heuristics, panel derived economics.
- Optional GitHub **Release** workflow on `v*` tags (see `.github/workflows/release.yml`).
- **Discovery** helpers for installations/locations (`api/discovery.py`, `models/discovery.py`).
- **Energy intelligence** aggregates for the panel (sessions, tariffs, live chargers, optional recorder history); see `docs/ENERGY_INTELLIGENCE.md`.
- **Charging explanation** and **assistant-style** suggestions (heuristics + panel copy).
- Optional **recorder peak** context for richer economics/insights.
- Panel **UI refresh**: advanced/devices tabs, overview KPIs, smart flow, charger overview, compact economics, status badges, charging-explanation UI; derived state and WebSocket hardening.

### Changed

- **Breaking behavior**: `last_successful_sync` timestamp only advances when consumption data is **not** stale (previously it could advance while data was stale).
- Tariffs/alerts fetch failures now mark the coordinator run as partial and surface `last_error`; auth failures consistently start the reauth flow.
- Services map `SmappeeApiError` / `SmappeeAuthError` to `HomeAssistantError`; LED brightness failures are no longer silently ignored.
- Diagnostic-style sensors use `entity_category`; `submeter_count` is unavailable when consumption is missing (instead of reporting 0).

### Fixed

- `parse_installations` now honors `serviceLocation` (singular) object or list in JSON responses.

## [0.1.1] - earlier

- See git history for prior changes.
