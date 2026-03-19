import type { HomeAssistant } from "../types/hass.js";
import type { PanelPayload } from "../types/panel.js";

const WS_PANEL = "ha_smappee_overview/get_panel_data";
const WS_LIST = "ha_smappee_overview/list_entries";

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

export async function fetchPanelData(
  hass: HomeAssistant,
  configEntryId: string
): Promise<PanelPayload> {
  const res = (await hass.connection.sendMessagePromise({
    type: WS_PANEL,
    config_entry_id: configEntryId,
  })) as PanelPayload;
  return res;
}

export interface HistoryPoint {
  t: number;
  v: number;
}

/** Last 24h power history for sparklines (downsampled). */
export async function fetchHistorySparklines(
  hass: HomeAssistant,
  entityIds: string[],
  maxPoints = 48
): Promise<Record<string, HistoryPoint[]>> {
  const ids = entityIds.filter(Boolean);
  if (!ids.length || typeof hass.callWS !== "function") {
    return {};
  }
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 3600 * 1000);
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
  } catch {
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
