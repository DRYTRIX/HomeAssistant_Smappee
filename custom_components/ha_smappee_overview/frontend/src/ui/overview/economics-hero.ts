import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../../types/panel.js";
import { renderLineageBadge } from "./data-lineage-badge.js";

export function renderEconomicsHero(p: PanelPayload): TemplateResult {
  const eco = p.economics;
  const monthly = p.reimbursement_monthly;
  const reim = p.reimbursement;
  const cur = reim?.currency ?? "EUR";
  const cap = reim?.belgium_cap;
  const rate = reim?.rate_per_kwh;
  const savings = p.overview_context?.month_smart_savings;

  return html`
    <div class="sov-econ-hero card">
      <h2 class="sov-h2">Economics & reimbursement</h2>
      <div class="sov-econ-grid">
        <div class="sov-econ-block sov-econ-primary">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Reimbursement this month</span>
            ${renderLineageBadge(
              "calculated",
              "Pending = configured rate × session energy in month."
            )}
          </div>
          <div class="sov-econ-big">
            ${monthly != null
              ? html`<strong>${monthly.pending_amount.toFixed(2)} ${cur}</strong>
                  <span class="muted sov-econ-sub"
                    >${monthly.total_kwh.toFixed(2)} kWh ·
                    ${monthly.sessions_count} sessions · ${monthly.month}</span
                  >`
              : html`<span class="muted">—</span>`}
          </div>
          <p class="sov-footnote muted small">
            Not a bank statement—verify against your tariff rules.
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Config rate</span>
            ${renderLineageBadge("config")}
          </div>
          <p>
            ${rate != null
              ? html`<strong>${rate.toFixed(4)} ${cur}/kWh</strong>`
              : html`<span class="muted">Not set</span>`}
            ${cap != null
              ? html`<span class="muted small"><br />BE cap: ${cap} ${cur}/kWh</span>`
              : ""}
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Today (sessions)</span>
            ${renderLineageBadge("calculated")}
          </div>
          <p>
            <strong>${eco?.today_kwh?.toFixed(2) ?? "—"} kWh</strong>
            <span class="muted">
              · pending ~${eco?.today_pending_eur?.toFixed(2) ?? "—"} ${cur}</span
            >
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Smart charging savings (est.)</span>
            ${renderLineageBadge(
              "calculated",
              "Tariff × kWh × solar share; approximate only."
            )}
          </div>
          <p>
            <strong
              >${savings != null
                ? `${savings.total_eur.toFixed(2)} ${savings.currency}`
                : "—"}</strong
            >
            <span class="muted small">
              ${savings != null
                ? ` · ${savings.sessions_count} sessions with solar share`
                : ""}
            </span>
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Self-use</span>
            ${renderLineageBadge("calculated")}
          </div>
          <p>
            Self-consumption:
            <strong>${p.consumption?.self_consumption_pct ?? "—"}%</strong><br />
            Self-sufficiency:
            <strong>${p.consumption?.self_sufficiency_pct ?? "—"}%</strong>
          </p>
        </div>
      </div>
    </div>
  `;
}
