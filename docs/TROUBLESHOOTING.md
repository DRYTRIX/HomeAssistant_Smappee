# Troubleshooting Guide

## No data visible

- Confirm the config entry is loaded in Home Assistant and no reauth is pending.
- Open panel `Diagnostics` and check `api_partial`, `last_error`, and `backend_health`.
- Use integration `Reconfigure` and enable `Test connection now`.
- If live cloud data is temporarily unavailable, enable `Demo mode` to keep dashboards operational.

## Device not detected

- Verify the selected installation/service location is correct in the panel header.
- In integration options, review `charging_park_id_override` when chargers are not listed.
- Check Home Assistant logs for parsing warnings and Smappee API connectivity errors.
- Use Diagnostics to confirm discovery node health (`ok`, `stale`, `offline`).

## Wrong values

- Check if the panel banner indicates `fallback` or `demo` data source.
- Validate tariff and reimbursement options (currency, cap, off-peak assumptions).
- Confirm local entity mappings in Diagnostics (`entity_map`) for grid/solar/consumption.
- For persistent mismatches, capture payload excerpts and compare with cloud app values.
