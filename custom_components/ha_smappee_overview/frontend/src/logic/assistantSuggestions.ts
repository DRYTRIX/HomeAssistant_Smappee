import type { HistoryPoint } from "../api/ws.js";
import type { PanelPayload } from "../types/panel.js";

export type AssistantSeverity = "info" | "warn";

export interface AssistantSavings {
  amount: number;
  currency: string;
  assumed_kwh: number;
  note: string;
}

/** Merged assistant card (server heuristics + optional history pattern). */
export interface AssistantSuggestion {
  id: string;
  category?: string;
  severity: AssistantSeverity;
  title: string;
  body: string;
  savings?: AssistantSavings;
  /** Set for client-only rows (e.g. history buckets). */
  source?: "server" | "history";
}

function hourlyMeans(points: HistoryPoint[]): Map<number, number> {
  const acc = new Map<number, { sum: number; n: number }>();
  for (const p of points) {
    const h = new Date(p.t).getHours();
    const o = acc.get(h) ?? { sum: 0, n: 0 };
    o.sum += p.v;
    o.n += 1;
    acc.set(h, o);
  }
  const out = new Map<number, number>();
  for (const [h, { sum, n }] of acc) {
    if (n > 0) out.set(h, sum / n);
  }
  return out;
}

function bestTwoHourSurplus(
  solarMeans: Map<number, number>,
  consMeans: Map<number, number>
): { startH: number; score: number } | null {
  let best: { startH: number; score: number } | null = null;
  for (let h = 0; h <= 22; h++) {
    const a = solarMeans.get(h);
    const b = solarMeans.get(h + 1);
    const ca = consMeans.get(h);
    const cb = consMeans.get(h + 1);
    if (
      a === undefined ||
      b === undefined ||
      ca === undefined ||
      cb === undefined
    ) {
      continue;
    }
    const score = (a + b - (ca + cb)) / 2;
    if (best === null || score > best.score) {
      best = { startH: h, score };
    }
  }
  return best;
}

function bestTwoHourExport(exportMeans: Map<number, number>): {
  startH: number;
  score: number;
} | null {
  let best: { startH: number; score: number } | null = null;
  for (let h = 0; h <= 22; h++) {
    const a = exportMeans.get(h);
    const b = exportMeans.get(h + 1);
    if (a === undefined || b === undefined) continue;
    const score = (a + b) / 2;
    if (best === null || score > best.score) {
      best = { startH: h, score };
    }
  }
  return best;
}

function formatLocalHourRange(startH: number, span = 2): string {
  const endH = startH + span;
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${pad(startH)}:00–${pad(endH)}:00`;
}

const MIN_POINTS = 10;
const MIN_SURPLUS_W = 250;
const MIN_EXPORT_W = 350;

export function buildHistorySurplusSuggestion(
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined
): AssistantSuggestion | null {
  if (!entityMap || !history) return null;

  const solarId = entityMap.solar;
  const consId = entityMap.consumption;
  const exportId = entityMap.grid_export;

  if (solarId && consId) {
    const sp = history[solarId] ?? [];
    const cp = history[consId] ?? [];
    if (sp.length >= MIN_POINTS && cp.length >= MIN_POINTS) {
      const sm = hourlyMeans(sp);
      const cm = hourlyMeans(cp);
      const best = bestTwoHourSurplus(sm, cm);
      if (best && best.score >= MIN_SURPLUS_W) {
        return {
          id: "history-surplus-pattern",
          category: "solar",
          severity: "info",
          title: "Typical solar surplus window (recent)",
          body: `In the last 24 hours, solar minus home load tended to be highest around ${formatLocalHourRange(best.startH)} (local time). This is a retrospective pattern from history—not a weather forecast.`,
          source: "history",
        };
      }
    }
  }

  if (exportId) {
    const ep = history[exportId] ?? [];
    if (ep.length >= MIN_POINTS) {
      const em = hourlyMeans(ep);
      const best = bestTwoHourExport(em);
      if (best && best.score >= MIN_EXPORT_W) {
        return {
          id: "history-export-pattern",
          category: "solar",
          severity: "info",
          title: "Typical export window (recent)",
          body: `Grid export was often strongest around ${formatLocalHourRange(best.startH)} (local) in the last 24 hours. Good past windows for self-consumption (e.g. EV charging) may repeat—but this is not a prediction.`,
          source: "history",
        };
      }
    }
  }

  return null;
}

function coerceServerSuggestions(raw: unknown): AssistantSuggestion[] {
  if (!Array.isArray(raw)) return [];
  const out: AssistantSuggestion[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    const title = typeof o.title === "string" ? o.title : null;
    const body = typeof o.body === "string" ? o.body : null;
    const sev = o.severity === "warn" || o.severity === "info" ? o.severity : null;
    if (!id || !title || !body || !sev) continue;
    const cat = typeof o.category === "string" ? o.category : undefined;
    let savings: AssistantSavings | undefined;
    const sv = o.savings;
    if (sv && typeof sv === "object") {
      const s = sv as Record<string, unknown>;
      const amount = typeof s.amount === "number" ? s.amount : Number.NaN;
      if (Number.isFinite(amount)) {
        const ak =
          typeof s.assumed_kwh === "number"
            ? s.assumed_kwh
            : Number(s.assumed_kwh);
        savings = {
          amount,
          currency: typeof s.currency === "string" ? s.currency : "EUR",
          assumed_kwh: Number.isFinite(ak) ? ak : 10,
          note: typeof s.note === "string" ? s.note : "",
        };
      }
    }
    out.push({
      id,
      category: cat,
      severity: sev,
      title,
      body,
      savings,
      source: "server",
    });
  }
  return out;
}

const MAX_CARDS = 5;

export function buildMergedAssistantSuggestions(
  p: PanelPayload,
  history: Record<string, HistoryPoint[]>,
  entityMap: Record<string, string | null> | undefined
): AssistantSuggestion[] {
  const server = coerceServerSuggestions(
    p.overview_context?.assistant_suggestions
  );
  const merged: AssistantSuggestion[] = [...server];
  const hist = buildHistorySurplusSuggestion(history, entityMap);
  if (
    hist &&
    merged.length < MAX_CARDS &&
    !merged.some((m) => m.id === hist.id)
  ) {
    merged.push(hist);
  }
  return merged.slice(0, MAX_CARDS);
}
