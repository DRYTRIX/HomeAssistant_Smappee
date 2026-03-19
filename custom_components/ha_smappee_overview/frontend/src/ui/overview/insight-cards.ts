import { html, nothing, type TemplateResult } from "lit";
import type { AssistantSuggestion } from "../../logic/assistantSuggestions.js";
import type { OverviewInsight } from "../../logic/overviewInsights.js";

function categoryLabel(cat: string | undefined): string {
  if (cat === "solar") return "Solar";
  if (cat === "cost") return "Cost";
  if (cat === "peak") return "Peak";
  return "Tip";
}

export function renderOperationalInsightCards(
  insights: OverviewInsight[]
): TemplateResult {
  if (!insights.length) return html``;
  return html`
    <div class="sov-insights">
      <h2 class="sov-h2">Insights</h2>
      <div class="sov-insight-grid">
        ${insights.map(
          (i) => html`
            <div class="card sov-insight sov-insight--${i.severity}">
              <div class="sov-insight-title">${i.title}</div>
              <p class="sov-insight-body muted">${i.body}</p>
            </div>
          `
        )}
      </div>
    </div>
  `;
}

export function renderAssistantCards(
  suggestions: AssistantSuggestion[]
): TemplateResult {
  if (!suggestions.length) return html``;
  return html`
    <div class="sov-insights">
      <h2 class="sov-h2">Assistant</h2>
      <div class="sov-insight-grid">
        ${suggestions.map(
          (i) => html`
            <div class="card sov-insight sov-insight--${i.severity}">
              <div class="sov-insight-head">
                ${i.category
                  ? html`<span class="sov-insight-cat">${categoryLabel(
                      i.category
                    )}</span>`
                  : nothing}
                <div class="sov-insight-title">${i.title}</div>
              </div>
              <p class="sov-insight-body muted">${i.body}</p>
              ${i.savings
                ? html`<p class="sov-insight-savings muted">
                    ~${i.savings.amount.toFixed(2)}
                    ${i.savings.currency} · ~${i.savings.assumed_kwh} kWh ·
                    ${i.savings.note}
                  </p>`
                : nothing}
            </div>
          `
        )}
      </div>
    </div>
  `;
}
