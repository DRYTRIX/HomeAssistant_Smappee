import type { HomeAssistant } from "../types/hass.js";
import type { PanelPayload } from "../types/panel.js";
import { logClientEvent } from "../observability.js";

const WS_PANEL = "ha_smappee_overview/get_panel_data";
const WS_LIST = "ha_smappee_overview/list_entries";
const WS_HEALTH = "ha_smappee_overview/health_check";

export interface ConfigEntryInfo {
  entry_id: string;
  title: string;
  service_location_id?: number;
}

function callWs(
  hass: HomeAssistant,
  msg: Record<string, unknown>
): Promise<unknown> {
  if (typeof hass.callWS === "function") {
    return hass.callWS(msg);
  }
  return hass.connection.sendMessagePromise(msg);
}

export async function listEntries(hass: HomeAssistant): Promise<ConfigEntryInfo[]> {
  const res = (await callWs(hass, { type: WS_LIST })) as {
    entries?: ConfigEntryInfo[];
  };
  return res.entries ?? [];
}

/** Validate WebSocket result; default missing arrays so the UI never assumes shape. */
export function normalizePanelPayload(raw: unknown): PanelPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Panel payload is not an object");
  }
  const o = raw as Record<string, unknown>;
  const warnings: string[] = [];
  if (!Array.isArray(o.chargers)) {
    warnings.push("missing_chargers_array_defaulted");
    o.chargers = [];
  }
  if (!Array.isArray(o.sessions_active)) {
    warnings.push("missing_sessions_active_defaulted");
    o.sessions_active = [];
  }
  if (!Array.isArray(o.sessions_recent)) {
    warnings.push("missing_sessions_recent_defaulted");
    o.sessions_recent = [];
  }
  if (!Array.isArray(o.tariffs)) {
    warnings.push("missing_tariffs_defaulted");
    o.tariffs = [];
  }
  if (!Array.isArray(o.alerts)) {
    warnings.push("missing_alerts_defaulted");
    o.alerts = [];
  }
  if (!o.discovery || typeof o.discovery !== "object") {
    o.discovery = {
      partial: true,
      notes: [],
      sources: {},
      generated_at: null,
      edges: [],
      nodes: [],
      summary: { ok: 0, offline: 0, stale: 0, unknown: 0 },
      consumption_stale_hint: false,
    };
  }
  const disc = o.discovery as Record<string, unknown>;
  if (!Array.isArray(disc.nodes)) disc.nodes = [];
  if (!Array.isArray(disc.edges)) disc.edges = [];
  if (!disc.summary || typeof disc.summary !== "object") {
    disc.summary = { ok: 0, offline: 0, stale: 0, unknown: 0 };
  }
  (o as Record<string, unknown>).__normalize_warnings = warnings;
  return o as unknown as PanelPayload;
}

export async function fetchPanelData(
  hass: HomeAssistant,
  configEntryId: string,
  includeAdvanced = false,
  debugLogs = false
): Promise<PanelPayload> {
  const msg: Record<string, unknown> = {
    type: WS_PANEL,
    config_entry_id: configEntryId,
  };
  if (includeAdvanced) {
    msg.include_advanced = true;
  }
  if (debugLogs) {
    msg.include_debug = true;
  }
  const res = await callWs(hass, msg);
  const normalized = normalizePanelPayload(res);
  if (debugLogs) {
    const p = normalized as unknown as Record<string, unknown>;
    logClientEvent("debug", "ws.fetch_panel_data", "panel payload", {
      keys: Object.keys(p),
      chargers: (normalized.chargers || []).length,
      sessions_active: (normalized.sessions_active || []).length,
      sessions_recent: (normalized.sessions_recent || []).length,
      normalize_warnings: p.__normalize_warnings || [],
    });
  }
  return normalized;
}

export interface HistoryPoint {
  t: number;
  v: number;
}

export interface HealthCheckPayload {
  status: "ok" | "degraded";
  entry_id: string;
  last_successful_update: string | null;
  api_partial: boolean;
  last_error: string | null;
  backend_health: Record<string, string>;
  validation_warnings: string[];
}

export async function fetchHealthCheck(
  hass: HomeAssistant,
  configEntryId: string
): Promise<HealthCheckPayload> {
  return (await callWs(hass, {
    type: WS_HEALTH,
    config_entry_id: configEntryId,
  })) as HealthCheckPayload;
}

/** Last 24h power history for sparklines (downsampled). */
export async function fetchHistorySparklines(
  hass: HomeAssistant,
  entityIds: string[],
  maxPoints = 48,
  windowMinutes = 24 * 60
): Promise<Record<string, HistoryPoint[]>> {
  const ids = entityIds.filter(Boolean);
  if (!ids.length || typeof hass.callWS !== "function") {
    return {};
  }
  const end = new Date();
  const start = new Date(end.getTime() - windowMinutes * 60 * 1000);
  let rows: unknown;
  try {
    rows = await hass.callWS({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: ids,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: true,
    });
  } catch (err) {
    logClientEvent("warning", "ws.fetch_history", "history fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {};
  }
  const out: Record<string, HistoryPoint[]> = {};
  const byEntity =
    rows && typeof rows === "object" && !Array.isArray(rows)
      ? (rows as Record<string, unknown[]>)
      : {};
  for (const eid of ids) {
    const states = byEntity[eid];
    if (!Array.isArray(states)) continue;
    const raw: HistoryPoint[] = [];
    for (const st of states) {
      if (!st || typeof st !== "object") continue;
      const s = st as { lu?: number; lc?: number; s?: string };
      const lu = s.lu ?? s.lc;
      const t = (typeof lu === "number" ? lu : 0) * 1000;
      const v = parseFloat(String(s.s ?? ""));
      if (!Number.isFinite(v)) continue;
      raw.push({ t, v });
    }
    if (raw.length <= maxPoints) {
      out[eid] = raw;
      continue;
    }
    const step = Math.ceil(raw.length / maxPoints);
    const sampled: HistoryPoint[] = [];
    for (let i = 0; i < raw.length; i += step) {
      sampled.push(raw[i]!);
    }
    out[eid] = sampled;
  }
  return out;
}
