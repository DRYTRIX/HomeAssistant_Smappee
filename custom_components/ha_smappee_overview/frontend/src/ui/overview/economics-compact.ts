import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../../types/panel.js";
import { renderLineageBadge } from "./data-lineage-badge.js";

/** Slim economics strip — detailed numbers live on the Economics tab. */
export function renderEconomicsCompact(p: PanelPayload): TemplateResult {
  const monthly = p.reimbursement_monthly;
  const reim = p.reimbursement;
  const cur = reim?.currency ?? "EUR";
  const savings = p.overview_context?.month_smart_savings;

  return html`
    <div class="card sov-econ-compact">
      <div class="sov-section-head">
        <h2 class="sov-h2">Economics snapshot</h2>
        ${renderLineageBadge("calculated")}
      </div>
      <div class="sov-econ-compact-inner">
        <div class="sov-econ-compact-stat">
          <div class="sov-econ-label">Pending reimbursement (month)</div>
          <strong
            >${monthly != null
              ? `${monthly.pending_amount.toFixed(2)} ${cur}`
              : "—"}</strong
          >
          <p class="muted small">
            ${monthly != null
              ? `${monthly.total_kwh.toFixed(2)} kWh · ${monthly.month}`
              : "Configure reimbursement in integration options."}
          </p>
        </div>
        <div class="sov-econ-compact-stat">
          <div class="sov-econ-label">Smart savings (est., month)</div>
          <strong
            >${savings != null
              ? `${savings.total_eur.toFixed(2)} ${savings.currency}`
              : "—"}</strong
          >
          <p class="muted small">
            Tariff × kWh × solar share — approximate. See Economics tab for
            periods.
          </p>
        </div>
      </div>
    </div>
  `;
}
