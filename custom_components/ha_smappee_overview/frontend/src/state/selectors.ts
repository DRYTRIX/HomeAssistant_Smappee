import type { PanelPayload, PanelSessionEnriched } from "../types/panel.js";
import type { SessionsFilters } from "./store.js";

export function selectFlowSummary(p: PanelPayload | null) {
  const c = p?.consumption;
  return {
    gridImport: c?.grid_import_w ?? null,
    gridExport: c?.grid_export_w ?? null,
    solar: c?.solar_w ?? null,
    home: c?.consumption_w ?? null,
    battery: c?.battery_flow_w ?? null,
    batterySoc: c?.battery_soc_pct ?? null,
  };
}

export function selectAllSessions(p: PanelPayload | null): PanelSessionEnriched[] {
  if (!p) return [];
  if (p.sessions_enriched?.length) return p.sessions_enriched;
  const seen = new Set<string>();
  const out: PanelSessionEnriched[] = [];
  for (const s of [...p.sessions_active, ...p.sessions_recent]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s as PanelSessionEnriched);
  }
  return out;
}

export function selectFilteredSessions(
  p: PanelPayload | null,
  f: SessionsFilters
): PanelSessionEnriched[] {
  let rows = selectAllSessions(p);
  if (f.chargerSerial) {
    rows = rows.filter((r) => r.charger_serial === f.chargerSerial);
  }
  if (f.userQuery?.trim()) {
    const q = f.userQuery.trim().toLowerCase();
    rows = rows.filter((r) => {
      const ud = (r.user_display || r.user_label || r.user_id || "").toLowerCase();
      const card = (r.card_label || "").toLowerCase();
      return (
        ud.includes(q) ||
        card.includes(q) ||
        (r.user_id && r.user_id.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }
  if (f.mode) {
    rows = rows.filter(
      (r) =>
        (r.effective_mode || r.status || "").toLowerCase() ===
        f.mode!.toLowerCase()
    );
  }
  if (f.periodStart) {
    const t = new Date(f.periodStart).getTime();
    rows = rows.filter((r) => {
      if (!r.start) return false;
      return new Date(r.start).getTime() >= t;
    });
  }
  if (f.periodEnd) {
    const t = new Date(f.periodEnd).getTime();
    rows = rows.filter((r) => {
      if (!r.start) return false;
      return new Date(r.start).getTime() <= t;
    });
  }
  return rows;
}

export function selectChargerLoadBalance(
  p: PanelPayload | null,
  serial: string
) {
  const ext = p?.chargers_extended?.find((x) => x.serial === serial);
  return ext?.load_balance ?? { reported: false, value: null };
}

export function selectBelgiumCapOk(p: PanelPayload | null): boolean | null {
  return p?.economics?.belgium_cap_compliant ?? null;
}

export function selectStaleBanner(p: PanelPayload | null): string | null {
  if (!p) return null;
  if (p.api_partial) return "Some data from the Smappee API is partial or failed to load.";
  if (p.consumption?.stale) return "Live consumption data may be stale.";
  if (p.meta?.consumption_stale) return "Consumption marked stale by coordinator.";
  return null;
}
