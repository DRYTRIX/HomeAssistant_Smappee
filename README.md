# ha_smappee_overview

HACS-ready Home Assistant custom integration with a **Smappee Overview** sidebar panel: unified energy snapshot, EV charger control, session list, and reimbursement helpers.

## Requirements

- Home Assistant **2024.8+**
- Smappee **developer app** (client ID & secret) and your Smappee account credentials

## Install (HACS)

1. Add this repository as a [custom repository](https://hacs.xyz/docs/faq/custom_repositories/) (type: Integration).
2. Install **Smappee Overview**.
3. Restart Home Assistant.
4. Add the integration via **Settings → Devices & services → Add integration → Smappee Overview**.

## Panel (control center)

After setup, open the sidebar entry named after your service location. The panel is a full-screen **Smappee control center**: overview with flow KPIs and 24h sparklines (from history), per-charger controls, sortable/filterable sessions, economics (including Belgium cap validation when **Country** is set to BE in options), and diagnostics.

WebSocket APIs used by the panel: `ha_smappee_overview/list_entries` (multi-installation selector) and `ha_smappee_overview/get_panel_data` (schema v2 payload with `sessions_enriched`, `entity_map`, `economics`, `diagnostics`, `overview_context`).

### Overview tab: data quality badges

The Overview uses small badges so you can tell what you are looking at:

| Badge | Meaning |
|-------|---------|
| **Live** | Real-time or latest connector/consumption state from Smappee. |
| **Calculated** | Derived in the integration (sessions + tariffs, e.g. pending reimbursement, today’s session totals, **smart charging savings estimate** = primary tariff × kWh × solar share). Not a utility invoice. |
| **Config** | Your reimbursement options or tariff metadata from Smappee. |

**Pause / charge-speed hints** (`overview_context.active_ev_hints`) are best-effort text from API status and connector mode. Refine them over time as we map more Smappee responses—see [docs/API_CAPTURE.md](docs/API_CAPTURE.md).

Static bundle: `custom_components/ha_smappee_overview/static/panel.js` (built from `frontend/`).

To rebuild the panel after changes:

```bash
cd custom_components/ha_smappee_overview/frontend
npm install
npm run build
```

## Services

| Service | Description |
|--------|-------------|
| `ha_smappee_overview.start_charging` | Start charging (optional `current_a`) |
| `ha_smappee_overview.pause_charging` | Pause |
| `ha_smappee_overview.stop_charging` | Stop (API pause) |
| `ha_smappee_overview.set_charging_mode` | `standard`, `smart`, or `solar` |
| `ha_smappee_overview.set_charging_current` | Set amperes |
| `ha_smappee_overview.set_led_brightness` | 0–100 if supported |
| `ha_smappee_overview.refresh` | Force data refresh |

All charger services require `config_entry_id`, `charger_serial`, and optionally `connector_position` (default `1`).

## Options & reconfigure

- **Options**: polling interval, reimbursement rate, currency, optional Belgium cap (EUR/kWh), optional **country code** (e.g. BE for panel cap validation).
- **Reconfigure** (integration menu): same fields + optional password to refresh OAuth tokens.

## API capture (contributors)

To help map session cost fields and charger payloads, see [docs/API_CAPTURE.md](docs/API_CAPTURE.md) and [tests/fixtures/smappee_redacted_samples.json](tests/fixtures/smappee_redacted_samples.json).

## Session / charger options

Under **Configure → Smappee Overview → Options**:

- **Session history (days)** — how far back to load charging sessions (1–90).
- **Max chargers for session poll** — parallel session API calls (1–20).
- **Charging park ID override** — if session list is empty, park fallback URL uses this ID instead of the service location ID.
- **Debug session JSON keys** — logs key names at debug level and shows them on the Diagnostics tab.

## Disclaimer

Smappee API field names vary by firmware and product. Missing metrics show as empty or “stale” in the UI. EV and session endpoints are best-effort.

## License

MIT
