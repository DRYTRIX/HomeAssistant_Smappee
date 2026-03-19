import { html, type TemplateResult } from "lit";
import type { HistoryPoint } from "../../api/ws.js";
import { selectFlowSummary } from "../../state/selectors.js";
import type { PanelPayload } from "../../types/panel.js";
import { renderSparkline } from "../sparkline.js";
import { renderLineageBadge } from "./data-lineage-badge.js";

function fmt(v: number | null | undefined, u: string): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Math.round(v)} ${u}`;
}

function spark(
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined,
  historyLoading: boolean,
  key: string,
  lbl: string
): TemplateResult {
  const eid = entityMap?.[key];
  const pts = eid ? history[eid] : undefined;
  if (historyLoading && !pts?.length) {
    return html`<div class="sov-spark-skel skel" aria-hidden="true"></div>`;
  }
  return renderSparkline(pts, lbl);
}

export function renderFlowKpis(
  p: PanelPayload,
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined,
  historyLoading: boolean
): TemplateResult {
  const f = selectFlowSummary(p);
  const hasConsumption = p.consumption != null;

  if (!hasConsumption) {
    return html`
      <div class="sov-flow-kpi-wrap">
        <div class="card sov-flow-card sov-flow-card--empty">
          <p class="muted">No live consumption snapshot yet.</p>
        </div>
      </div>
    `;
  }

  return html`
    <div class="sov-flow-kpi-wrap">
      <div class="card sov-flow-schematic">
        <div class="sov-section-head">
          <h2 class="sov-h2">Energy flow</h2>
          ${renderLineageBadge("live")}
        </div>
        <div class="sov-flow-nodes">
          <div class="sov-flow-node">
            <span class="flow-label">Solar</span>
            <strong>${fmt(f.solar, "W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Grid in</span>
            <strong>${fmt(f.gridImport, "W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Grid out</span>
            <strong>${fmt(f.gridExport, "W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Home</span>
            <strong>${fmt(f.home, "W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Battery</span>
            <strong>${fmt(f.battery, "W")}</strong>
            ${f.batterySoc != null
              ? html`<span class="muted">${f.batterySoc}% SoC</span>`
              : ""}
          </div>
        </div>
      </div>
      <div class="sov-kpi-grid">
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Grid import</span>
            ${renderLineageBadge("live")}
          </div>
          <div class="kpi-v">${fmt(f.gridImport, "W")}</div>
          ${spark(history, entityMap, historyLoading, "grid_import", "Grid import")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Solar</span>
            ${renderLineageBadge("live")}
          </div>
          <div class="kpi-v">${fmt(f.solar, "W")}</div>
          ${spark(history, entityMap, historyLoading, "solar", "Solar")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Consumption</span>
            ${renderLineageBadge("live")}
          </div>
          <div class="kpi-v">${fmt(f.home, "W")}</div>
          ${spark(history, entityMap, historyLoading, "consumption", "Consumption")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Battery</span>
            ${renderLineageBadge("live")}
          </div>
          <div class="kpi-v">${fmt(f.battery, "W")}</div>
          ${spark(history, entityMap, historyLoading, "battery_flow", "Battery")}
        </div>
      </div>
    </div>
  `;
}
