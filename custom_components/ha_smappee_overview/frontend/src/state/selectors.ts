import type { PanelPayload, PanelSessionEnriched } from "../types/panel.js";
import type { SessionsFilters } from "./store.js";

export type DashboardUiState =
  | "loading"
  | "ready"
  | "empty_no_devices"
  | "empty_time_range"
  | "error_connection"
  | "error_no_data_range"
  | "error_parsing"
  | "partial";

export type DataFreshness = "live" | "stale" | "offline";

export interface WidgetStatus {
  lastUpdate: string | null;
  freshness: DataFreshness;
  source: "device" | "protocol";
}

function parseMaybeDate(v?: string | null): number | null {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

export function deriveWidgetStatus(
  p: PanelPayload | null,
  source: "device" | "protocol" = "device"
): WidgetStatus {
  const last =
    p?.consumption?.timestamp ??
    p?.last_successful_update ??
    p?.discovery?.generated_at ??
    null;
  const ts = parseMaybeDate(last);
  if (!ts) {
    return { lastUpdate: null, freshness: "offline", source };
  }
  const ageMs = Date.now() - ts;
  const staleHint =
    p?.consumption?.stale ||
    p?.meta?.consumption_stale ||
    p?.meta?.coordinator_last_update_success === false;
  if (staleHint || ageMs > 10 * 60 * 1000) {
    return { lastUpdate: last, freshness: "stale", source };
  }
  return { lastUpdate: last, freshness: "live", source };
}

export function selectDashboardUiState(
  p: PanelPayload | null,
  connection: "idle" | "loading" | "connected" | "error" | "reconnecting",
  panelError: string | null,
  filters?: SessionsFilters
): DashboardUiState {
  if (connection === "loading" && !p) return "loading";
  if (connection === "error") return "error_connection";
  if (panelError?.toLowerCase().includes("parse")) return "error_parsing";
  if (!p) return "error_connection";
  const hasAnyData =
    Boolean(p.consumption) ||
    (p.chargers?.length ?? 0) > 0 ||
    (p.sessions_active?.length ?? 0) > 0 ||
    (p.sessions_recent?.length ?? 0) > 0;
  if (!hasAnyData) return "empty_no_devices";
  if (filters?.periodStart || filters?.periodEnd) {
    const filtered = selectFilteredSessions(p, filters);
    if (!filtered.length) return "error_no_data_range";
  }
  if (p.api_partial) return "partial";
  return "ready";
}

export function formatIsoLocal(iso: string | null | undefined): string {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 19);
}

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
    const dt = new Date(f.periodEnd);
    dt.setHours(23, 59, 59, 999);
    const t = dt.getTime();
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
  if (p.meta?.data_source === "demo") return "Demo mode is active. Values are synthetic.";
  if (p.meta?.data_source === "fallback") {
    return "Live data unavailable. Showing fallback telemetry.";
  }
  if (p.api_partial) return "Some data from the Smappee API is partial or failed to load.";
  if (p.consumption?.stale) return "Live consumption data may be stale.";
  if (p.meta?.consumption_stale) return "Consumption marked stale by coordinator.";
  return null;
}
