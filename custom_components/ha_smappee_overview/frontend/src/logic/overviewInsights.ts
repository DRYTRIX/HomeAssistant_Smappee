import type { PanelPayload } from "../types/panel.js";
import { selectFlowSummary } from "../state/selectors.js";

export type InsightSeverity = "info" | "warn";

export interface OverviewInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  body: string;
}

function anyConnectorCharging(p: PanelPayload): boolean {
  const active = [...p.sessions_active, ...(p.sessions_enriched ?? [])];
  const seen = new Set<string>();
  for (const s of active) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    if (/charging|started/i.test(s.status || "")) return true;
  }
  return false;
}

/** At most 4 operational hints for power users. */
export function buildOverviewInsights(p: PanelPayload): OverviewInsight[] {
  const out: OverviewInsight[] = [];
  const f = selectFlowSummary(p);

  if (
    f.gridExport != null &&
    f.gridExport > 400 &&
    !anyConnectorCharging(p)
  ) {
    out.push({
      id: "export-opportunity",
      severity: "info",
      title: "Export opportunity",
      body:
        "Significant power is flowing to the grid while no EV session is actively charging. Smart or solar charging modes could use this surplus.",
    });
  }

  if (
    f.gridImport != null &&
    f.gridImport > 1500 &&
    (f.solar == null || f.solar < 800)
  ) {
    out.push({
      id: "peak-grid-draw",
      severity: "warn",
      title: "High grid import",
      body:
        "Household draw is relying heavily on the grid with limited solar contribution. Consider shifting loads or checking tariff windows.",
    });
  }

  if (
    f.batterySoc != null &&
    f.batterySoc >= 88 &&
    f.battery != null &&
    f.battery < -200 &&
    f.gridExport != null &&
    f.gridExport > 300
  ) {
    out.push({
      id: "battery-full-export",
      severity: "info",
      title: "Battery saturated, exporting",
      body:
        "Battery is full or discharging lightly while solar still exports—surplus is leaving to the grid.",
    });
  }

  if (f.solar != null && f.solar > 2000 && f.home != null && f.home < 500) {
    out.push({
      id: "solar-surplus",
      severity: "info",
      title: "Strong solar harvest",
      body:
        "Low home consumption vs solar production—good window for EV charging if you need range.",
    });
  }

  return out.slice(0, 4);
}
