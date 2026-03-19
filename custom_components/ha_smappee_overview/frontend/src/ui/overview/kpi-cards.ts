import { html, type TemplateResult } from "lit";
import type { HistoryPoint } from "../../api/ws.js";
import {
  buildOverviewKpis,
  type DerivedMetric,
  type MetricSource,
} from "../../logic/overviewDerived.js";
import type { PanelPayload } from "../../types/panel.js";
import { renderSparkline } from "../sparkline.js";
import { renderLineageBadge } from "./data-lineage-badge.js";

function lineageForSource(s: MetricSource): "live" | "calculated" | "config" {
  if (s === "live") return "live";
  if (s === "calculated") return "calculated";
  if (s === "estimated") return "calculated";
  return "live";
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

function kpiCard(
  title: string,
  m: DerivedMetric,
  sparkTpl: TemplateResult,
  narrow: boolean
): TemplateResult {
  return html`
    <div
      class="card kpi sov-kpi-premium ${narrow ? "sov-kpi-premium--full" : ""}"
      title=${m.tooltip}
      aria-label=${`${title}: ${m.value}. ${m.tooltip}`}
    >
      <div class="sov-kpi-head">
        <span class="kpi-h">${title}</span>
        ${m.source === "missing"
          ? ""
          : renderLineageBadge(
              lineageForSource(m.source),
              m.tooltip
            )}
      </div>
      <div class="sov-kpi-premium-val">${m.value}</div>
      <div class="sov-kpi-spark">${sparkTpl}</div>
    </div>
  `;
}

export function renderKpiCards(
  p: PanelPayload,
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined,
  historyLoading: boolean,
  narrow: boolean
): TemplateResult {
  const k = buildOverviewKpis(p);
  return html`
    <div class="sov-kpi-premium-grid">
      ${kpiCard(
        "Consumption",
        k.consumption,
        spark(history, entityMap, historyLoading, "consumption", "Consumption"),
        narrow
      )}
      ${kpiCard(
        "Solar",
        k.solar,
        spark(history, entityMap, historyLoading, "solar", "Solar"),
        narrow
      )}
      ${kpiCard(
        "EV (est.)",
        k.evPower,
        html`<div class="spark-empty" title="No history entity for EV power">
          Trend N/A
        </div>`,
        narrow
      )}
      ${kpiCard(
        "Tariff now",
        k.tariff,
        html`<div class="spark-empty">—</div>`,
        narrow
      )}
      ${kpiCard(
        "Cost today (est.)",
        k.todayCost,
        html`<div class="spark-empty">—</div>`,
        narrow
      )}
      ${kpiCard(
        "Self-consumption",
        k.selfConsumption,
        spark(
          history,
          entityMap,
          historyLoading,
          "self_consumption",
          "Self-consumption"
        ),
        narrow
      )}
    </div>
  `;
}
