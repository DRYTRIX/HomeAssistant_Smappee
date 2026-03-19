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

function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function dayKey(start: string | null | undefined): string {
  if (!start) return "unknown";
  return start.slice(0, 10);
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
      case "reimb":
        va = a.reimbursement_estimate ?? 0;
        vb = b.reimbursement_estimate ?? 0;
        break;
      case "solar":
        va = a.solar_share_pct ?? 0;
        vb = b.solar_share_pct ?? 0;
        break;
      case "savings":
        va = a.solar_savings_estimate ?? 0;
        vb = b.solar_savings_estimate ?? 0;
        break;
      case "duration":
        va = a.duration_s ?? 0;
        vb = b.duration_s ?? 0;
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

export interface SessionsTabOptions {
  groupByDay: boolean;
  expandedRowId: string | null;
  onToggleGroupByDay: (v: boolean) => void;
  onToggleExpand: (id: string | null) => void;
}

const COL_COUNT = 12;

export function renderSessionsTab(
  p: PanelPayload,
  filters: SessionsFilters,
  sort: { column: string; dir: "asc" | "desc" },
  tabOpts: SessionsTabOptions,
  onFilter: (f: Partial<SessionsFilters>) => void,
  onSort: (col: string) => void,
  onExport: () => void
): TemplateResult {
  let rows = selectFilteredSessions(p, filters);
  rows = sortRows(rows, sort.column, sort.dir);

  const chargers = p.chargers ?? [];
  const toggleSort = (col: string) => onSort(col);
  const allCount =
    (p.sessions_enriched?.length ?? 0) ||
    p.sessions_active.length + p.sessions_recent.length;

  type Group = { key: string; label: string; rows: PanelSessionEnriched[] };
  let groups: Group[];
  if (tabOpts.groupByDay) {
    const map = new Map<string, PanelSessionEnriched[]>();
    for (const r of rows) {
      const k = dayKey(r.start ?? undefined);
      const list = map.get(k) ?? [];
      list.push(r);
      map.set(k, list);
    }
    groups = [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([k, rs]) => ({
        key: k,
        label: k === "unknown" ? "Unknown date" : k,
        rows: rs,
      }));
  } else {
    groups = [{ key: "all", label: "", rows }];
  }

  const renderRow = (r: PanelSessionEnriched): TemplateResult => {
    const open = tabOpts.expandedRowId === r.id;
    return html`
      <tr
        class="sess-row ${open ? "sess-row--open" : ""}"
        @click=${() =>
          tabOpts.onToggleExpand(open ? null : r.id)}
      >
        <td>${r.start?.replace("T", " ").slice(0, 19) ?? "—"}</td>
        <td>${formatDuration(r.duration_s ?? undefined)}</td>
        <td class="mono">${r.charger_serial.slice(0, 8)}…</td>
        <td>${r.energy_wh != null ? (r.energy_wh / 1000).toFixed(2) : "—"}</td>
        <td>${formatApiCost(r)}</td>
        <td>${r.cost_estimate ?? "—"}</td>
        <td>${r.reimbursement_estimate ?? "—"}</td>
        <td>${r.solar_share_pct ?? "—"}</td>
        <td>${r.solar_savings_estimate ?? "—"}</td>
        <td>
          ${r.user_display ?? r.user_label ?? r.user_id ?? "—"}${r.card_label
            ? html`<br /><span class="muted mono small">${r.card_label}</span>`
            : ""}
        </td>
        <td>${r.effective_mode ?? r.status}</td>
        <td class="muted small">${open ? "▼" : "▶"}</td>
      </tr>
      ${open
        ? html`
            <tr class="sess-detail-row">
              <td colspan=${COL_COUNT}>
                <div class="sess-detail card-inner">
                  <div class="mono small">Session ${r.id}</div>
                  <div class="mono small">Charger ${r.charger_serial}</div>
                  <p class="small">
                    End:
                    ${r.end?.replace("T", " ").slice(0, 19) ?? "—"} · Tariff
                    id: ${r.tariff_id ?? "—"}
                  </p>
                </div>
              </td>
            </tr>
          `
        : ""}
    `;
  };

  return html`
    ${p.api_partial
      ? html`<div class="banner">
          Session list may be incomplete (partial API data).
        </div>`
      : ""}
    <p class="muted small">
      Showing ${rows.length} of ${allCount} session(s) in this payload.
    </p>
    <div class="sessions-toolbar card">
      <div class="toolbar-row">
        <label class="sess-toggle">
          <input
            type="checkbox"
            ?checked=${tabOpts.groupByDay}
            @change=${(e: Event) =>
              tabOpts.onToggleGroupByDay(
                (e.target as HTMLInputElement).checked
              )}
          />
          Group by day
        </label>
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
      <button
        type="button"
        class="btn secondary"
        disabled
        title="Coming soon"
        @click=${onExport}
      >
        Export CSV (soon)
      </button>
    </div>
    <div class="table-wrap card">
      <table class="data-table data-table--sessions">
        <thead>
          <tr>
            <th @click=${() => toggleSort("start")}>
              Start
              ${sort.column === "start"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("duration")}>
              Duration
              ${sort.column === "duration"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th>Charger</th>
            <th @click=${() => toggleSort("energy")}>
              kWh
              ${sort.column === "energy"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("cost_api")}>
              Cost (API)
              ${sort.column === "cost_api"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("cost")}>
              Cost est.
              ${sort.column === "cost"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("reimb")}>
              Reimb. est.
              ${sort.column === "reimb"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("solar")}>
              Solar %
              ${sort.column === "solar"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th @click=${() => toggleSort("savings")}>
              Savings est.
              ${sort.column === "savings"
                ? sort.dir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th>User / card</th>
            <th>Mode</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? html`<tr>
                <td colspan=${COL_COUNT} class="muted">
                  No sessions match filters.
                </td>
              </tr>`
            : groups.flatMap((g) => [
                g.label
                  ? html`
                      <tr class="sess-group-head">
                        <td colspan=${COL_COUNT}>
                          <strong>${g.label}</strong>
                          · ${g.rows.length} session(s) ·
                          ${g.rows.reduce((s, x) => s + (x.energy_wh ?? 0), 0) /
                            1000} kWh
                        </td>
                      </tr>
                    `
                  : html``,
                ...g.rows.map((r) => renderRow(r)),
              ])}
        </tbody>
      </table>
    </div>
  `;
}
