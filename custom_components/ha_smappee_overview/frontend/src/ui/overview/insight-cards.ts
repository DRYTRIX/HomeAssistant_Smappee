import { html, type TemplateResult } from "lit";
import type { OverviewInsight } from "../../logic/overviewInsights.js";

export function renderInsightCards(insights: OverviewInsight[]): TemplateResult {
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
