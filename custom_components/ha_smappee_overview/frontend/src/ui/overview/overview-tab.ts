import { html, type TemplateResult } from "lit";
import type { HistoryPoint } from "../../api/ws.js";
import { buildMergedAssistantSuggestions } from "../../logic/assistantSuggestions.js";
import { buildOverviewInsights } from "../../logic/overviewInsights.js";
import type { HomeAssistant } from "../../types/hass.js";
import type { ConnectionState, PanelPayload } from "../../types/panel.js";
import type { WidgetStatus } from "../../state/selectors.js";
import { collectAnomalies, renderAnomalyBadges } from "./anomalies.js";
import { renderChargerOverviewCards } from "./charger-overview-card.js";
import { renderEconomicsCompact } from "./economics-compact.js";
import { renderHealthStrip } from "./health-strip.js";
import {
  renderAssistantCards,
  renderOperationalInsightCards,
} from "./insight-cards.js";
import { renderEmptyState } from "./empty-state.js";
import { renderKpiCards } from "./kpi-cards.js";
import { renderSmartFlow } from "./smart-flow.js";
import { renderStatusBadges } from "./status-badges.js";
import { renderWidgetStatus } from "../state-ui.js";

export interface OverviewTabOptions {
  connection: ConnectionState;
  historyLoading: boolean;
  narrow: boolean;
  hass: HomeAssistant;
  entryId: string;
  afterAction: () => void;
  onOpenChargersTab: () => void;
  onOpenDiagnostics: () => void;
  widgetStatus: WidgetStatus;
  loading: boolean;
  layoutTemplate: "default" | "operations" | "compact";
  layoutOrder: string[];
  onTemplateChange: (template: "default" | "operations" | "compact") => void;
  onLayoutReorder: (order: string[]) => void;
}

const ALL_WIDGETS = ["flow_kpi", "insights", "assistant", "economics", "chargers"] as const;
type WidgetId = (typeof ALL_WIDGETS)[number];
type TemplateId = "default" | "operations" | "compact";

const TEMPLATE_ORDERS: Record<TemplateId, WidgetId[]> = {
  default: ["flow_kpi", "insights", "assistant", "economics", "chargers"],
  operations: ["chargers", "flow_kpi", "assistant", "insights", "economics"],
  compact: ["flow_kpi", "economics", "chargers", "insights", "assistant"],
};

function normalizeOrder(order: string[]): WidgetId[] {
  const out: WidgetId[] = [];
  const seen = new Set<string>();
  for (const item of order) {
    if (!ALL_WIDGETS.includes(item as WidgetId) || seen.has(item)) continue;
    seen.add(item);
    out.push(item as WidgetId);
  }
  for (const item of ALL_WIDGETS) {
    if (!seen.has(item)) out.push(item);
  }
  return out;
}

export function renderOverviewTab(
  p: PanelPayload,
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined,
  opt: OverviewTabOptions
): TemplateResult {
  const entityMapPresent = Boolean(
    entityMap && Object.keys(entityMap).length > 0
  );
  const anomalies = collectAnomalies(p);
  const assistantCards = buildMergedAssistantSuggestions(
    p,
    history,
    entityMap
  );
  const operationalInsights = buildOverviewInsights(p);
  const thin = opt.narrow;
  const activeTemplate = opt.layoutTemplate;
  const currentOrder = normalizeOrder(opt.layoutOrder);

  const sections: Record<WidgetId, TemplateResult> = {
    flow_kpi: html`<div class="sov-overview-main-grid">
      <div class="sov-overview-flow-col">${renderSmartFlow(p, opt.loading)}</div>
      <div class="sov-overview-kpi-col">
        ${renderKpiCards(p, history, entityMap, opt.historyLoading, thin)}
      </div>
    </div>`,
    insights: renderOperationalInsightCards(operationalInsights),
    assistant: renderAssistantCards(assistantCards),
    economics: renderEconomicsCompact(p),
    chargers: renderChargerOverviewCards(
      p,
      opt.hass,
      opt.entryId,
      opt.afterAction,
      opt.onOpenChargersTab
    ),
  };

  return html`
    <div class="sov-root ${thin ? "sov-root--narrow" : ""}">
      <section class="sov-widget-toolbar card card-inner">
        <label>
          Widget template
          <select
            .value=${activeTemplate}
            @change=${(e: Event) => {
              const template = (e.target as HTMLSelectElement).value as TemplateId;
              const nextOrder = TEMPLATE_ORDERS[template];
              opt.onTemplateChange(template);
              opt.onLayoutReorder(nextOrder);
            }}
          >
            <option value="default">Default</option>
            <option value="operations">Operations focus</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <button
          class="btn secondary"
          type="button"
          @click=${() => opt.onLayoutReorder(TEMPLATE_ORDERS[activeTemplate])}
        >
          Reset layout
        </button>
      </section>
      ${renderHealthStrip(
        p,
        opt.connection,
        opt.historyLoading,
        entityMapPresent,
        undefined
      )}
      <section class="sov-scan">
        <h2 class="sov-visually-hidden">Installation health</h2>
        ${renderAnomalyBadges(anomalies)}
      </section>
      ${renderStatusBadges(p)}
      ${renderWidgetStatus(opt.widgetStatus)}
      ${!p.consumption && !p.chargers?.length
        ? renderEmptyState(
            "No data received yet",
            "No consumption snapshot and no chargers yet. Possible causes: no devices connected, wrong time range, or a data pipeline issue.",
            "Open diagnostics",
            opt.onOpenDiagnostics
          )
        : html`
            <div class="sov-widget-grid">
              ${currentOrder.map(
                (id) => html`<section
                  class="sov-widget"
                  draggable="true"
                  data-widget-id=${id}
                  @dragstart=${(e: DragEvent) =>
                    e.dataTransfer?.setData("text/plain", id)}
                  @dragover=${(e: DragEvent) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement | null)?.classList.add(
                      "sov-widget--drop-target"
                    );
                  }}
                  @dragleave=${(e: DragEvent) =>
                    (e.currentTarget as HTMLElement | null)?.classList.remove(
                      "sov-widget--drop-target"
                    )}
                  @drop=${(e: DragEvent) => {
                    e.preventDefault();
                    const from = (e.dataTransfer?.getData("text/plain") || "") as WidgetId;
                    const to = id;
                    if (!ALL_WIDGETS.includes(from) || from === to) return;
                    const next = [...currentOrder];
                    const fromIdx = next.indexOf(from);
                    const toIdx = next.indexOf(to);
                    if (fromIdx < 0 || toIdx < 0) return;
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, from);
                    opt.onLayoutReorder(next);
                    (e.currentTarget as HTMLElement | null)?.classList.remove(
                      "sov-widget--drop-target"
                    );
                  }}
                >
                  <header class="sov-widget-head">
                    <span class="sov-widget-handle" title="Drag to reorder">::</span>
                  </header>
                  ${sections[id]}
                </section>`
              )}
            </div>
          `}
    </div>
  `;
}
