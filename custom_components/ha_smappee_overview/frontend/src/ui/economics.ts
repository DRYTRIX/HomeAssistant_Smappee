import { html, type TemplateResult } from "lit";
import { selectAllSessions } from "../state/selectors.js";
import type { PanelPayload, PanelSessionEnriched } from "../types/panel.js";

export type EconomicsPeriod = "today" | "month" | "year";

interface Rollup {
  kwh: number;
  costEst: number;
  reimb: number;
  solarSave: number;
  count: number;
}

function rollupSessions(rows: PanelSessionEnriched[]): Rollup {
  let kwh = 0;
  let costEst = 0;
  let reimb = 0;
  let solarSave = 0;
  let count = 0;
  for (const r of rows) {
    if (r.energy_wh != null && r.energy_wh > 0) {
      kwh += r.energy_wh / 1000;
      count += 1;
    }
    if (r.cost_estimate != null) costEst += r.cost_estimate;
    if (r.reimbursement_estimate != null) reimb += r.reimbursement_estimate;
    if (r.solar_savings_estimate != null) solarSave += r.solar_savings_estimate;
  }
  return { kwh, costEst, reimb, solarSave, count };
}

function filterByMonth(
  rows: PanelSessionEnriched[],
  monthYyyyMm: string
): PanelSessionEnriched[] {
  return rows.filter(
    (r) => r.start && r.start.slice(0, 7) === monthYyyyMm
  );
}

function filterByYear(
  rows: PanelSessionEnriched[],
  year: string
): PanelSessionEnriched[] {
  return rows.filter((r) => r.start && r.start.slice(0, 4) === year);
}

export function renderEconomicsTab(
  p: PanelPayload,
  period: EconomicsPeriod,
  onPeriod: (p: EconomicsPeriod) => void
): TemplateResult {
  const cur = p.reimbursement?.currency ?? "EUR";
  const cap = p.reimbursement?.belgium_cap;
  const rate = p.reimbursement?.rate_per_kwh;
  const eco = p.economics;
  const monthly = p.reimbursement_monthly;
  const hist = eco?.reimbursement_history ?? [];
  const allSessions = selectAllSessions(p);

  const now = new Date();
  const monthKey =
    monthly?.month ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const yearKey = String(now.getUTCFullYear());

  const monthRows = filterByMonth(allSessions, monthKey);
  const yearRows = filterByYear(allSessions, yearKey);
  const monthRoll = rollupSessions(monthRows);
  const yearRoll = rollupSessions(yearRows);

  const beBadge =
    p.country_code === "BE"
      ? html`
          <div
            class="card be-badge ${eco?.belgium_cap_compliant === false ? "warn" : "ok"}"
          >
            <strong>Belgium cap</strong>
            ${cap != null
              ? html`<p>Cap: ${cap} EUR/kWh · Your rate: ${rate ?? "—"} EUR/kWh</p>`
              : html`<p>Configure cap in integration options.</p>`}
            ${eco?.belgium_cap_compliant === true
              ? html`<p class="ok-text">Rate within cap.</p>`
              : eco?.belgium_cap_compliant === false
                ? html`<p class="warn-text">Rate exceeds configured cap.</p>`
                : ""}
          </div>
        `
      : html``;

  const tabBtn = (id: EconomicsPeriod, label: string) => html`
    <button
      type="button"
      class=${period === id ? "active" : ""}
      @click=${() => onPeriod(id)}
    >
      ${label}
    </button>
  `;

  let periodBody: TemplateResult;
  if (period === "today") {
    periodBody = html`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Energy &amp; money (today, UTC)</h3>
          <p>
            EV energy (sessions): <strong>${eco?.today_kwh?.toFixed(2) ?? "—"} kWh</strong>
          </p>
          <p>
            Tariff cost (est.):
            <strong
              >${eco?.today_charging_cost_estimate_eur != null
                ? `${eco.today_charging_cost_estimate_eur.toFixed(2)} ${cur}`
                : "—"}</strong
            >
          </p>
          <p>
            Pending reimbursement (est.):
            <strong
              >${eco?.today_pending_eur != null
                ? `${eco.today_pending_eur.toFixed(2)} ${cur}`
                : "—"}</strong
            >
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${eco?.today_charging_cost_estimate_eur != null
              ? html`Today's charging ≈
                  <strong
                    >${eco.today_charging_cost_estimate_eur.toFixed(2)}
                    ${cur}</strong
                  >
                  at primary tariff (estimate).`
              : html`<span class="muted">No tariff-based cost estimate for today.</span>`}
          </p>
          <p class="econ-hero-line">
            ${eco?.today_pending_eur != null
              ? html`<strong>${eco.today_pending_eur.toFixed(2)} ${cur}</strong>
                  pending reimbursement today (configured rate × energy).`
              : ""}
          </p>
        </div>
      </div>
    `;
  } else if (period === "month") {
    const ms = p.overview_context?.month_smart_savings;
    periodBody = html`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Month ${monthKey}</h3>
          <p>
            Sessions in payload: <strong>${monthRoll.count}</strong> ·
            <strong>${monthRoll.kwh.toFixed(2)} kWh</strong>
          </p>
          <p>
            Cost (est. sum): <strong>${monthRoll.costEst.toFixed(2)} ${cur}</strong>
          </p>
          <p>
            Reimbursement (est. sum):
            <strong>${monthRoll.reimb.toFixed(2)} ${cur}</strong>
          </p>
          <p>
            Solar savings (est. sum):
            <strong>${monthRoll.solarSave.toFixed(2)} ${cur}</strong>
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${monthly != null
              ? html`<strong>${monthly.pending_amount.toFixed(2)} ${cur}</strong>
                  pending reimbursement (${monthly.total_kwh.toFixed(2)} kWh,
                  ${monthly.sessions_count} sessions).`
              : html`<span class="muted">No monthly reimbursement summary.</span>`}
          </p>
          <p class="econ-hero-line">
            ${ms != null && ms.total_eur > 0
              ? html`You saved ≈
                  <strong
                    >${ms.total_eur.toFixed(2)} ${ms.currency}</strong
                  >
                  via solar-weighted tariff (estimated,
                  ${ms.sessions_count} sessions).`
              : html`<span class="muted">No smart/solar savings total for this month.</span>`}
          </p>
        </div>
      </div>
    `;
  } else {
    periodBody = html`
      <div class="card">
        <h3 class="card-h">Year ${yearKey} (payload window)</h3>
        ${p.api_partial
          ? html`<div class="banner">Partial API data — figures may be incomplete.</div>`
          : ""}
        <p class="muted small">
          Only sessions present in this panel's history window are included
          (${yearRoll.count} sessions, ${yearRoll.kwh.toFixed(2)} kWh).
        </p>
        <p>
          Cost (est. sum): <strong>${yearRoll.costEst.toFixed(2)} ${cur}</strong>
        </p>
        <p>
          Reimbursement (est. sum):
          <strong>${yearRoll.reimb.toFixed(2)} ${cur}</strong>
        </p>
        <p>
          Solar savings (est. sum):
          <strong>${yearRoll.solarSave.toFixed(2)} ${cur}</strong>
        </p>
        <p class="econ-hero-line">
          ${yearRoll.solarSave > 0
            ? html`≈ <strong>${yearRoll.solarSave.toFixed(2)} ${cur}</strong> in
                estimated solar tariff savings for listed sessions.`
            : ""}
        </p>
      </div>
    `;
  }

  return html`
    ${beBadge}
    <nav class="econ-period-tabs" aria-label="Economics period">
      ${tabBtn("today", "Today")} ${tabBtn("month", "Month")}
      ${tabBtn("year", "Year")}
    </nav>
    ${periodBody}
    <div class="card">
      <h3 class="card-h">All tariffs (API)</h3>
      <p class="muted small">
        Session <em>cost estimates</em> use the first tariff only when multiple
        exist.
      </p>
      ${(() => {
        const list = p.economics?.tariffs_all?.length
          ? p.economics.tariffs_all
          : p.tariffs ?? [];
        return list.length
          ? html`
              <ul class="tariff-list">
                ${list.map(
                  (t, i) => html`
                    <li>
                      ${i === 0 && list.length > 1
                        ? html`<span class="badge">primary (estimates)</span> `
                        : ""}
                      <strong>${t.name ?? t.id}</strong> —
                      ${t.price_per_kwh ?? "—"} ${t.currency ?? ""} / kWh
                    </li>
                  `
                )}
              </ul>
            `
          : html`<p class="muted">No tariff data from API.</p>`;
      })()}
    </div>
    <div class="card row-2">
      <div>
        <h3 class="card-h">Split billing / reimbursement</h3>
        <p>Rate: <strong>${rate ?? "—"}</strong> ${cur}/kWh</p>
        <p>
          Config rate applies to pending amounts shown on Today / Month views.
        </p>
      </div>
      <div>
        <h3 class="card-h">Reimbursement history</h3>
        ${hist.length
          ? html`<ul>${hist.map((h) => {
              const x = h as { valid_from?: string; rate_per_kwh?: number };
              return html`<li>${x.valid_from}: ${x.rate_per_kwh}</li>`;
            })}</ul>`
          : html`<p class="muted">No history entries (options-only rate).</p>`}
      </div>
    </div>
  `;
}
