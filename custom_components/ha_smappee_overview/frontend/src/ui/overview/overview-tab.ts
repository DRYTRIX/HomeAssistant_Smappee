import { html, type TemplateResult } from "lit";
import type { HistoryPoint } from "../../api/ws.js";
import { buildMergedAssistantSuggestions } from "../../logic/assistantSuggestions.js";
import { buildOverviewInsights } from "../../logic/overviewInsights.js";
import type { HomeAssistant } from "../../types/hass.js";
import type { ConnectionState, PanelPayload } from "../../types/panel.js";
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

export interface OverviewTabOptions {
  connection: ConnectionState;
  historyLoading: boolean;
  narrow: boolean;
  hass: HomeAssistant;
  entryId: string;
  afterAction: () => void;
  onOpenChargersTab: () => void;
  onOpenDiagnostics: () => void;
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

  return html`
    <div class="sov-root ${thin ? "sov-root--narrow" : ""}">
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
      ${!p.consumption && !p.chargers?.length
        ? renderEmptyState(
            "Waiting for data",
            "No consumption snapshot and no chargers yet. Refresh or check Diagnostics.",
            "Open diagnostics",
            opt.onOpenDiagnostics
          )
        : html`
            <div class="sov-overview-main-grid">
              <div class="sov-overview-flow-col">
                ${renderSmartFlow(p)}
              </div>
              <div class="sov-overview-kpi-col">
                ${renderKpiCards(
                  p,
                  history,
                  entityMap,
                  opt.historyLoading,
                  thin
                )}
              </div>
            </div>
            ${renderOperationalInsightCards(operationalInsights)}
            ${renderAssistantCards(assistantCards)}
            ${renderEconomicsCompact(p)}
            ${renderChargerOverviewCards(
              p,
              opt.hass,
              opt.entryId,
              opt.afterAction,
              opt.onOpenChargersTab
            )}
          `}
    </div>
  `;
}
