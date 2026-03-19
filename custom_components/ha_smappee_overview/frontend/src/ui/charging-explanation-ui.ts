import { html, type TemplateResult } from "lit";
import type { PanelChargingExplanation } from "../types/panel.js";

function sourceLabel(s: string): string {
  if (s === "live") return "Live";
  if (s === "config") return "Config";
  return "Est.";
}

/** Badge, tooltip (title), expandable technical details and suggestions. */
export function renderChargingExplanationBlock(
  expl: PanelChargingExplanation | undefined
): TemplateResult {
  if (!expl) {
    return html``;
  }
  const tone = expl.badge.tone;
  const chain = expl.technical?.limit_chain ?? [];
  const hasDetails =
    chain.length > 0 ||
    (expl.details && Object.keys(expl.details).length > 0) ||
    (expl.technical?.signals &&
      Object.keys(expl.technical.signals).length > 0);
  return html`
    <div class="exp-expl-wrap">
      <span
        class="chip exp-badge exp-badge--${tone}"
        title=${expl.message}
        >${expl.badge.label}</span
      >
      <details class="exp-details">
        <summary>Technical details</summary>
        <p class="muted small exp-expl-msg">${expl.message}</p>
        ${expl.suggestions?.length
          ? html`
              <div class="exp-suggest-h">What you can try</div>
              <ul class="exp-suggest">
                ${expl.suggestions.map(
                  (s) => html`<li>${s.label}</li>`
                )}
              </ul>
            `
          : ""}
        ${chain.length
          ? html`
              <div class="exp-chain-h">Limit chain</div>
              <ol class="exp-chain-list">
                ${chain.map(
                  (step) => html`
                    <li class="exp-chain-li">
                      <span class="exp-chain-label">${step.label}</span>
                      <span class="mono">${step.value}</span>
                      <span class="exp-chain-src exp-chain-src--${step.source}"
                        >${sourceLabel(step.source)}</span
                      >
                    </li>
                  `
                )}
              </ol>
            `
          : ""}
        ${hasDetails
          ? html`
              <div class="exp-chain-h">Raw signals</div>
              <pre class="json-pre exp-json">
${JSON.stringify(
                  {
                    details: expl.details,
                    pause_code: expl.technical?.pause_code,
                    signals: expl.technical?.signals,
                  },
                  null,
                  2
                )}</pre
              >
            `
          : ""}
      </details>
    </div>
  `;
}
