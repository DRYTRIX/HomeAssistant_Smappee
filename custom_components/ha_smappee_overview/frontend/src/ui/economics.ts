import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../types/panel.js";

export function renderEconomicsTab(p: PanelPayload): TemplateResult {
  const cur = p.reimbursement?.currency ?? "EUR";
  const cap = p.reimbursement?.belgium_cap;
  const rate = p.reimbursement?.rate_per_kwh;
  const eco = p.economics;
  const monthly = p.reimbursement_monthly;
  const hist = eco?.reimbursement_history ?? [];

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
      : "";

  return html`
    ${beBadge}
    <div class="card">
      <h3 class="card-h">All tariffs (API)</h3>
      <p class="muted small">
        Session <em>cost estimates</em> use the first tariff only when multiple exist.
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
          Today pending: <strong>${eco?.today_pending_eur?.toFixed(2) ?? "—"} ${cur}</strong>
          (${eco?.today_kwh?.toFixed(2) ?? "—"} kWh)
        </p>
        <p>
          Month ${monthly?.month}: <strong>${monthly?.pending_amount ?? "—"} ${cur}</strong>
          (${monthly?.total_kwh ?? "—"} kWh, ${monthly?.sessions_count ?? 0} sessions)
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
