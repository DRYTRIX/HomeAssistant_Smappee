import type { HistoryPoint } from "../api/ws.js";
import type {
  ConnectionState,
  PanelPayload,
  TabId,
} from "../types/panel.js";

const STORAGE_KEY = "smappee_panel_entry";
const STORAGE_ADVANCED = "smappee_panel_advanced";
const STORAGE_DEBUG = "smappee_panel_debug";
const STORAGE_OVERVIEW_LAYOUT = "smappee_panel_overview_layout";

export interface SessionsFilters {
  chargerSerial?: string;
  userQuery?: string;
  mode?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface SmappeeStoreState {
  entries: Array<{ entry_id: string; title: string }>;
  selectedEntryId: string;
  activeTab: TabId;
  panel: PanelPayload | null;
  connection: ConnectionState;
  panelError: string | null;
  tabError: string | null;
  historyByEntity: Record<string, HistoryPoint[]>;
  historyLoading: boolean;
  lastFetchAt: number | null;
  sessionsSort: { column: string; dir: "asc" | "desc" };
  sessionsFilters: SessionsFilters;
  sessionsExpandedRowId: string | null;
  sessionsGroupByDay: boolean;
  economicsPeriod: "today" | "month" | "year";
  timePreset: "live" | "5m" | "1h" | "24h";
  /** UI-only: request include_advanced on panel WS when integration allows */
  advancedMode: boolean;
  debugMode: boolean;
  overviewTemplate: "default" | "operations" | "compact";
  overviewOrder: string[];
}

export type Listener = () => void;

export function createSmappeeStore(defaultEntryId: string): {
  getState: () => SmappeeStoreState;
  subscribe: (fn: Listener) => () => void;
  setState: (patch: Partial<SmappeeStoreState>) => void;
  loadStoredEntry: () => string;
  persistEntry: (id: string) => void;
  persistAdvancedMode: (on: boolean) => void;
  persistDebugMode: (on: boolean) => void;
  persistOverviewLayout: (
    template: SmappeeStoreState["overviewTemplate"],
    order: string[]
  ) => void;
} {
  let stored = defaultEntryId;
  try {
    const s = sessionStorage.getItem(STORAGE_KEY);
    if (s) stored = s;
  } catch {
    /* ignore */
  }

  let advStored = false;
  try {
    advStored = sessionStorage.getItem(STORAGE_ADVANCED) === "1";
  } catch {
    /* ignore */
  }
  let debugStored = false;
  try {
    debugStored = sessionStorage.getItem(STORAGE_DEBUG) === "1";
  } catch {
    /* ignore */
  }
  let layoutTemplate: SmappeeStoreState["overviewTemplate"] = "default";
  let layoutOrder: string[] = ["flow_kpi", "insights", "assistant", "economics", "chargers"];
  try {
    const raw = sessionStorage.getItem(STORAGE_OVERVIEW_LAYOUT);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        template?: SmappeeStoreState["overviewTemplate"];
        order?: string[];
      };
      if (
        parsed.template === "default" ||
        parsed.template === "operations" ||
        parsed.template === "compact"
      ) {
        layoutTemplate = parsed.template;
      }
      if (Array.isArray(parsed.order) && parsed.order.every((x) => typeof x === "string")) {
        layoutOrder = parsed.order;
      }
    }
  } catch {
    /* ignore */
  }

  let state: SmappeeStoreState = {
    entries: [],
    selectedEntryId: stored || defaultEntryId,
    activeTab: "overview",
    panel: null,
    connection: "idle",
    panelError: null,
    tabError: null,
    historyByEntity: {},
    historyLoading: false,
    lastFetchAt: null,
    sessionsSort: { column: "start", dir: "desc" },
    sessionsFilters: {},
    sessionsExpandedRowId: null,
    sessionsGroupByDay: false,
    economicsPeriod: "today",
    timePreset: "live",
    advancedMode: advStored,
    debugMode: debugStored,
    overviewTemplate: layoutTemplate,
    overviewOrder: layoutOrder,
  };

  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setState: (patch) => {
      const next = { ...state, ...patch };
      let changed = false;
      for (const key of Object.keys(patch) as Array<keyof SmappeeStoreState>) {
        if (state[key] !== next[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = next;
      listeners.forEach((l) => l());
    },
    loadStoredEntry: () => stored || defaultEntryId,
    persistEntry: (id) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      stored = id;
    },
    persistAdvancedMode: (on) => {
      try {
        if (on) sessionStorage.setItem(STORAGE_ADVANCED, "1");
        else sessionStorage.removeItem(STORAGE_ADVANCED);
      } catch {
        /* ignore */
      }
      state = { ...state, advancedMode: on };
      listeners.forEach((l) => l());
    },
    persistDebugMode: (on) => {
      try {
        if (on) sessionStorage.setItem(STORAGE_DEBUG, "1");
        else sessionStorage.removeItem(STORAGE_DEBUG);
      } catch {
        /* ignore */
      }
      state = { ...state, debugMode: on };
      listeners.forEach((l) => l());
    },
    persistOverviewLayout: (template, order) => {
      const nextOrder = [...order];
      try {
        sessionStorage.setItem(
          STORAGE_OVERVIEW_LAYOUT,
          JSON.stringify({ template, order: nextOrder })
        );
      } catch {
        /* ignore */
      }
      state = { ...state, overviewTemplate: template, overviewOrder: nextOrder };
      listeners.forEach((l) => l());
    },
  };
}
