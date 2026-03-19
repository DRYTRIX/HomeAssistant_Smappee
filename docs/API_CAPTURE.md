# Capturing Smappee API responses (redacted)

Use this guide to collect **redacted** JSON samples so we can map session cost fields, charger load-balancing keys, and tariff shapes across firmware versions.

## What to capture

| Endpoint (examples) | Why |
|---------------------|-----|
| `GET /dev/v3/chargingstations/{serial}/sessions` | Session `cost`, `currency`, `userName`, `cardLabel`, etc. |
| `GET /dev/v3/servicelocation/{id}/chargingstations` | Load balancing, max current, connector details |
| `GET /dev/v2/servicelocation/{id}/tariffs` | TOU / multiple tariffs |

## Tools

1. **mitmproxy** (recommended): proxy phone or HA host, install Smappee app cert, browse the app.
2. **Charles / HTTP Toolkit**: same idea.
3. **Home Assistant debug logging**: enable `custom_components.ha_smappee_overview.api.client: debug` and inspect error bodies (limited).

## Redaction rules

Remove or replace:

- Email, name, street, full serials if you prefer (short prefixes OK).
- OAuth tokens, passwords.
- Exact GPS if present.

Keep:

- JSON **keys** and value **types** (numbers/strings/booleans).
- Example numeric magnitudes (e.g. `cost: 3.42` → OK).

## Submitting

Open a GitHub issue with:

1. Product (EV Wall, Ultra, etc.) and rough firmware.
2. Paste redacted JSON or attach `tests/fixtures/smappee_redacted_samples.json`-style snippets.

Fixture examples live in [`tests/fixtures/smappee_redacted_samples.json`](../tests/fixtures/smappee_redacted_samples.json).
