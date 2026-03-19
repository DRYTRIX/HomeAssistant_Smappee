import { html, type TemplateResult } from "lit";
import { selectFilteredSessions } from "../state/selectors.js";
import type {
  PanelPayload,
  PanelSessionEnriched,
} from "../types/panel.js";
import type { SessionsFilters } from "../state/store.js";

function formatApiCost(r: PanelSessionEnriched): string {
  if (r.cost_api_amount == null) return "—";
  const cur = r.cost_api_currency ?? "";
  return `${r.cost_api_amount.toFixed(2)} ${cur}`.trim();
}

function sortRows(
  rows: PanelSessionEnriched[],
  col: string,
  dir: "asc" | "desc"
): PanelSessionEnriched[] {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let va: string | number = 0;
    let vb: string | number = 0;
    switch (col) {
      case "start":
        va = a.start ? new Date(a.start).getTime() : 0;
        vb = b.start ? new Date(b.start).getTime() : 0;
        break;
      case "energy":
        va = a.energy_wh ?? 0;
        vb = b.energy_wh ?? 0;
        break;
      case "cost":
        va = a.cost_estimate ?? 0;
        vb = b.cost_estimate ?? 0;
        break;
      case "cost_api":
        va = a.cost_api_amount ?? 0;
        vb = b.cost_api_amount ?? 0;
        break;
      default:
        va = String(a.id);
        vb = String(b.id);
    }
    if (va < vb) return -1 * m;
    if (va > vb) return 1 * m;
    return 0;
  });
}

export function renderSessionsTab(
  p: PanelPayload,
  filters: SessionsFilters,
  sort: { column: string; dir: "asc" | "desc" },
  onFilter: (f: Partial<SessionsFilters>) => void,
  onSort: (col: string) => void,
  onExport: () => void
): TemplateResult {
  let rows = selectFilteredSessions(p, filters);
  rows = sortRows(rows, sort.column, sort.dir);

  const chargers = p.chargers ?? [];
  const toggleSort = (col: string) => onSort(col);

  return html`
    <div class="sessions-toolbar card">
      <div class="toolbar-row">
        <label>
          Charger
          <select
            @change=${(e: Event) =>
              onFilter({
                chargerSerial:
                  (e.target as HTMLSelectElement).value || undefined,
              })}
          >
            <option value="">All</option>
            ${chargers.map(
              (c) =>
                html`<option
                  value=${c.serial}
                  ?selected=${filters.chargerSerial === c.serial}
                >
                  ${c.name}
                </option>`
            )}
          </select>
        </label>
        <label>
          User / ID
          <input
            type="search"
            placeholder="Filter…"
            .value=${filters.userQuery ?? ""}
            @input=${(e: Event) =>
              onFilter({
                userQuery: (e.target as HTMLInputElement).value,
              })}
          />
        </label>
        <label>
          Mode
          <select
            @change=${(e: Event) =>
              onFilter({
                mode: (e.target as HTMLSelectElement).value || undefined,
              })}
          >
            <option value="">All</option>
            <option value="charging">charging</option>
            <option value="paused">paused</option>
            <option value="ended">ended</option>
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            .value=${filters.periodStart ?? ""}
            @change=${(e: Event) =>
              onFilter({
                periodStart: (e.target as HTMLInputElement).value || undefined,
              })}
          />
        </label>
        <label>
          To
          <input
            type="date"
            .value=${filters.periodEnd ?? ""}
            @change=${(e: Event) =>
              onFilter({
                periodEnd: (e.target as HTMLInputElement).value || undefined,
              })}
          />
        </label>
      </div>
      <button type="button" class="btn secondary" disabled title="Coming soon" @click=${onExport}>
        Export CSV (soon)
      </button>
    </div>
    <div class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th @click=${() => toggleSort("start")}>Start ${sort.column === "start" ? (sort.dir === "asc" ? "▲" : "▼") : ""}</th>
            <th>Charger</th>
            <th @click=${() => toggleSort("energy")}>kWh</th>
            <th @click=${() => toggleSort("cost_api")}>Cost (API)</th>
            <th @click=${() => toggleSort("cost")}>Cost est.</th>
            <th>Reimb. est.</th>
            <th>Solar %</th>
            <th>Savings est.</th>
            <th>User / card</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? html`<tr>
                <td colspan="10" class="muted">No sessions match filters.</td>
              </tr>`
            : rows.map(
                (r) => html`
                  <tr>
                    <td>${r.start?.replace("T", " ").slice(0, 19) ?? "—"}</td>
                    <td class="mono">${r.charger_serial.slice(0, 8)}…</td>
                    <td>${r.energy_wh != null ? (r.energy_wh / 1000).toFixed(2) : "—"}</td>
                    <td>${formatApiCost(r)}</td>
                    <td>${r.cost_estimate ?? "—"}</td>
                    <td>${r.reimbursement_estimate ?? "—"}</td>
                    <td>${r.solar_share_pct ?? "—"}</td>
                    <td>${r.solar_savings_estimate ?? "—"}</td>
                    <td>${r.user_display ?? r.user_label ?? r.user_id ?? "—"}${r.card_label ? html`<br /><span class="muted mono small">${r.card_label}</span>` : ""}</td>
                    <td>${r.effective_mode ?? r.status}</td>
                  </tr>
                `
              )}
        </tbody>
      </table>
    </div>
  `;
}
