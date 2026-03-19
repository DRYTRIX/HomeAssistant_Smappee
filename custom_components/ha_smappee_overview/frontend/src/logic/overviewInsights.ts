import { maxPhaseCurrentA } from "./overviewDerived.js";
import type { PanelPayload } from "../types/panel.js";
import { selectAllSessions, selectFlowSummary } from "../state/selectors.js";

export interface OverviewInsight {
  id: string;
  severity: "info" | "warn";
  title: string;
  body: string;
}

function anySessionCharging(p: PanelPayload): boolean {
  for (const s of selectAllSessions(p)) {
    if (/charging|started/i.test(s.status || "")) return true;
  }
  return false;
}

/** Best-effort operational hints for the overview (non-blocking). */
export function buildOverviewInsights(p: PanelPayload): OverviewInsight[] {
  const t = selectFlowSummary(p);
  const out: OverviewInsight[] = [];

  if (
    t.gridExport != null &&
    t.gridExport > 400 &&
    !anySessionCharging(p)
  ) {
    out.push({
      id: "export-opportunity",
      severity: "info",
      title: "Export opportunity",
      body: "Significant power is flowing to the grid while no EV session is actively charging. Smart or solar charging modes could use this surplus.",
    });
  }

  if (
    t.gridImport != null &&
    t.gridImport > 1500 &&
    (t.solar == null || t.solar < 800)
  ) {
    out.push({
      id: "peak-grid-draw",
      severity: "warn",
      title: "High grid import",
      body: "Household draw is relying heavily on the grid with limited solar contribution. Consider shifting loads or checking tariff windows.",
    });
  }

  if (
    t.batterySoc != null &&
    t.batterySoc >= 88 &&
    t.battery != null &&
    t.battery < -200 &&
    t.gridExport != null &&
    t.gridExport > 300
  ) {
    out.push({
      id: "battery-full-export",
      severity: "info",
      title: "Battery saturated, exporting",
      body: "Battery is full or discharging little while exporting to the grid. Surplus could go to an EV if a session starts.",
    });
  }

  if (t.solar != null && t.solar > 2000 && t.home != null && t.home < 500) {
    out.push({
      id: "solar-surplus",
      severity: "info",
      title: "Strong solar harvest",
      body: "Low home consumption vs solar production — a good window for EV charging if you need range.",
    });
  }

  const hints = p.overview_context?.active_ev_hints ?? [];
  const seenLb = new Set<string>();
  for (const h of hints) {
    const charging = /charging|started/i.test(h.status || "");
    const hasLb = (h.limit_chain ?? []).some((s) => s.factor === "load_balance");
    if (charging && hasLb && !seenLb.has(h.session_id)) {
      seenLb.add(h.session_id);
      out.push({
        id: `load-balance-${h.session_id}`,
        severity: "warn",
        title: "Charging may be grid-limited",
        body: "Load balancing reports a cap on available current. The wallbox may be slower than your set limit until headroom improves.",
      });
    }
  }

  const thr = p.overview_context?.peak_phase_current_warning_a;
  const maxA = maxPhaseCurrentA(p.consumption ?? undefined);
  if (thr != null && maxA != null && maxA >= thr) {
    out.push({
      id: "peak-phase-current",
      severity: "warn",
      title: "Phase current near your alert threshold",
      body: `Highest reported phase current is ${maxA.toFixed(1)} A (your warning is ${thr} A). Check main fuse / capacity tariffs if relevant.`,
    });
  }

  return out.slice(0, 6);
}
