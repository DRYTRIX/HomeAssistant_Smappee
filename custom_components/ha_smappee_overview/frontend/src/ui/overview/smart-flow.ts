import { html, type TemplateResult } from "lit";
import { buildFlowModel } from "../../logic/overviewDerived.js";
import { deriveWidgetStatus } from "../../state/selectors.js";
import type { PanelPayload } from "../../types/panel.js";
import { renderLineageBadge } from "./data-lineage-badge.js";
import { renderWidgetSkeleton, renderWidgetStatus } from "../state-ui.js";

function nodeClass(kind: string): string {
  if (kind === "grid") return "sov-sf-node--grid";
  if (kind === "solar") return "sov-sf-node--solar";
  if (kind === "battery") return "sov-sf-node--battery";
  if (kind === "ev") return "sov-sf-node--ev";
  return "sov-sf-node--home";
}

export function renderSmartFlow(
  p: PanelPayload,
  loading = false
): TemplateResult {
  const { nodes, hasConsumption } = buildFlowModel(p);
  const status = deriveWidgetStatus(p, "device");
  if (!hasConsumption) {
    return html`
      <div class="card sov-smart-flow sov-smart-flow--empty">
        <div class="sov-section-head">
          <h2 class="sov-h2">Energy flow</h2>
        </div>
        ${renderWidgetStatus(status)}
        ${loading
          ? renderWidgetSkeleton(2)
          : html`<p class="muted">No live consumption snapshot yet.</p>`}
      </div>
    `;
  }

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const renderNode = (id: string): TemplateResult => {
    const n = byId[id];
    if (!n) return html``;
    return html`
      <div class="sov-sf-node ${nodeClass(n.id)}">
        <span class="sov-sf-node-label">${n.label}</span>
        <strong class="sov-sf-node-val">${n.powerW != null ? `${Math.round(n.powerW)} W` : "—"}</strong>
        ${n.sub
          ? html`<span class="sov-sf-node-sub muted small">${n.sub}</span>`
          : ""}
      </div>
    `;
  };

  return html`
    <div class="card sov-smart-flow">
      <div class="sov-section-head">
        <h2 class="sov-h2">Energy flow</h2>
        ${renderLineageBadge("live")}
      </div>
      ${renderWidgetStatus(status)}
      <p class="muted small sov-sf-hint">
        Flow arrows show direction of power. EV power is estimated when a session is active.
      </p>
      <div class="sov-sf-diagram" role="img" aria-label="Energy flow diagram">
        <div class="sov-sf-row sov-sf-row--top">
          ${renderNode("solar")}
          <div class="sov-sf-connector sov-sf-connector--solar" aria-hidden="true"></div>
          ${renderNode("home")}
          <div class="sov-sf-connector sov-sf-connector--grid-in" aria-hidden="true"></div>
          ${renderNode("grid")}
        </div>
        <div class="sov-sf-row sov-sf-row--bot">
          ${renderNode("battery")}
          <div class="sov-sf-connector sov-sf-connector--bat" aria-hidden="true"></div>
          <div class="sov-sf-spacer"></div>
          <div class="sov-sf-connector sov-sf-connector--ev" aria-hidden="true"></div>
          ${renderNode("ev")}
        </div>
      </div>
    </div>
  `;
}
