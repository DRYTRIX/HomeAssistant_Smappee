# Energy Intelligence

The **Energy Intelligence** layer aggregates Smappee charging sessions, tariffs, reimbursement options, live charger currents, and (optionally) Home Assistant recorder history into panel metrics. It is **informational**: it is not a substitute for your energy supplier’s invoice or certified metering.

## Time boundaries

- **Calendar day and month** use **UTC**, consistent with other aggregates in this integration.
- Your installation may have a local timezone in Smappee; we do not yet remap session timestamps to local midnight. Future versions could use `Installation.timezone` when present.

## Tariffs and cost

- **Primary tariff** is the **first** tariff returned by the Smappee API when several exist.
- Per session, if `tariff_id` matches a tariff id in that list, its `price_per_kwh` is used; otherwise the primary price applies.
- **Preferred cost** for a session:
  1. Smappee **API cost** (`cost_amount`), when present.
  2. Else **kWh × resolved unit price** (from the step above).
- **Time-of-use (TOU)** or dynamic tariffs are **not** modeled unless the API exposes interval-based prices (it currently does not in this integration).

## Realtime cost estimate

- When a connector reports `session_active` and a positive `current_a`, we estimate power as:

  `P_W = sum(current_a) × line_voltage × phases`

  with `line_voltage` and `phases` from **integration options** (defaults: 230 V, 1 phase).

- **€/h** = `(P_W / 1000) × primary_tariff_per_kwh`.

This ignores power factor, three-phase √3 layout, and DC chargers. Treat it as a **rough** indicator.

## Smart charging savings

- **In scope**: sessions classified as smart/solar using status strings, `mode` / `chargingMode` in raw JSON, or keywords such as SMART / SOLAR / WAIT / DEFER.
- **Counterfactual**: for those sessions, energy is priced as **kWh × primary_tariff** (as if all energy were bought at the flat primary rate with no optimisation).
- **Actual**: sum of **preferred cost** for the same sessions.
- **Savings (display)** = `max(0, counterfactual − actual)`. The raw difference is also exposed; a **negative** raw value usually means API cost exceeds the flat estimate or mixed modes/data gaps.

This does **not** prove causality from “smart algorithm” alone; it is a defined counterfactual for transparency.

## Solar EV analysis

- **Solar share** comes from Smappee’s per-session **`solarShare`** (percentage), not from whole-home self-consumption or inverter data in Home Assistant.
- **Weighted solar %** = Σ(kWh × solar_share) / Σ(kWh) for sessions in the UTC month that report a share.
- **Solar kWh** / **grid kWh** split uses that percentage per session. Sessions **without** `solarShare` accumulate **unknown_solar_kwh**.

## Reimbursement

- Rates come from **integration options**, with optional **Belgium cap** applied as `min(rate, cap)`.
- **Completed** vs **in_progress** vs **other** buckets use **session status** only (e.g. COMPLETED vs CHARGING). This is **not** “paid vs unpaid” in an accounting sense unless you track payments elsewhere.

## Belgium capacity (proxy)

- When **country = BE** and **capacity tracking** is enabled, the integration queries the HA **recorder** for the **`grid_import`** entity (same logical key as the panel entity map) from **UTC month start → now**.
- The **peak** is the **maximum numeric state** seen in that period (and the current state), interpreted as **watts**, then converted to **kW**.
- Real Belgian **capacity tariffs** often use **specific averaging windows** (e.g. quarterly peaks). This is a **proxy** for awareness, not a regulatory calculation.
- **Annual impact** = `peak_kw × user_supplied €/kW/year` is **illustrative** only.

## Data completeness

- Session lists are **bounded** by polling and `session_history_days`. Costs and solar stats for a month may be **incomplete** if sessions aged out of the window.

## Versioning

- The WebSocket field `energy_intelligence.schema_version` is bumped when the JSON shape changes in a breaking way.
