import type { HistoryPoint } from "../api/ws.js";
import type {
  ConnectionState,
  PanelPayload,
  TabId,
} from "../types/panel.js";

const STORAGE_KEY = "smappee_panel_entry";
const STORAGE_ADVANCED = "smappee_panel_advanced";

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
  /** UI-only: request include_advanced on panel WS when integration allows */
  advancedMode: boolean;
}

export type Listener = () => void;

export function createSmappeeStore(defaultEntryId: string): {
  getState: () => SmappeeStoreState;
  subscribe: (fn: Listener) => () => void;
  setState: (patch: Partial<SmappeeStoreState>) => void;
  loadStoredEntry: () => string;
  persistEntry: (id: string) => void;
  persistAdvancedMode: (on: boolean) => void;
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
    advancedMode: advStored,
  };

  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setState: (patch) => {
      state = { ...state, ...patch };
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
  };
}
