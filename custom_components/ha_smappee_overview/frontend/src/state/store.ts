import type { HistoryPoint } from "../api/ws.js";
import type {
  ConnectionState,
  PanelPayload,
  TabId,
} from "../types/panel.js";

const STORAGE_KEY = "smappee_panel_entry";

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
}

export type Listener = () => void;

export function createSmappeeStore(defaultEntryId: string): {
  getState: () => SmappeeStoreState;
  subscribe: (fn: Listener) => () => void;
  setState: (patch: Partial<SmappeeStoreState>) => void;
  loadStoredEntry: () => string;
  persistEntry: (id: string) => void;
} {
  let stored = defaultEntryId;
  try {
    const s = sessionStorage.getItem(STORAGE_KEY);
    if (s) stored = s;
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
  };
}
