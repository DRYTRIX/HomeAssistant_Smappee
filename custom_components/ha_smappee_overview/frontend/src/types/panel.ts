/** Panel WebSocket payload (v1 + v2). */

export interface PanelMeta {
  schema_version: number;
  update_interval_s: number;
  coordinator_last_update_success: boolean;
  consumption_stale: boolean;
}

export interface PanelConsumption {
  timestamp?: string;
  stale?: boolean;
  grid_import_w?: number | null;
  grid_export_w?: number | null;
  solar_w?: number | null;
  consumption_w?: number | null;
  battery_flow_w?: number | null;
  self_consumption_pct?: number | null;
  self_sufficiency_pct?: number | null;
  battery_soc_pct?: number | null;
}

export interface PanelSessionEnriched {
  id: string;
  charger_serial: string;
  connector: number;
  status: string;
  energy_wh?: number | null;
  start?: string | null;
  end?: string | null;
  solar_share_pct?: number | null;
  user_id?: string | null;
  user_label?: string | null;
  card_label?: string | null;
  user_display?: string | null;
  cost_api_amount?: number | null;
  cost_api_currency?: string | null;
  tariff_id?: string | null;
  effective_mode?: string | null;
  cost_estimate?: number | null;
  reimbursement_estimate?: number | null;
  solar_savings_estimate?: number | null;
}

export interface PanelCharger {
  serial: string;
  name: string;
  availability: boolean;
  connectors: Array<{
    position: number;
    mode: string;
    current_a?: number | null;
    session_active: boolean;
  }>;
}

export interface PanelPayload {
  schema_version?: number;
  installation?: { id: number; name: string } | null;
  installation_features?: Record<string, boolean>;
  charger_features?: Record<
    string,
    {
      is_dc: boolean;
      supports_smart_mode: boolean;
      supports_current_limit: boolean;
      supports_availability_patch: boolean;
      max_current_a?: number | null;
    }
  >;
  consumption?: PanelConsumption | null;
  chargers: PanelCharger[];
  sessions_active: PanelSessionEnriched[];
  sessions_recent: PanelSessionEnriched[];
  sessions_enriched?: PanelSessionEnriched[];
  tariffs: Array<{
    id?: string | null;
    name?: string | null;
    currency?: string | null;
    price_per_kwh?: number | null;
  }>;
  alerts: Array<{ id: string; message: string; severity: string }>;
  reimbursement?: {
    rate_per_kwh: number;
    currency: string;
    belgium_cap?: number | null;
  } | null;
  reimbursement_monthly?: {
    month: string;
    total_kwh: number;
    pending_amount: number;
    sessions_count: number;
  } | null;
  last_successful_update?: string | null;
  last_error?: string | null;
  api_partial?: boolean;
  country_code?: string | null;
  meta?: PanelMeta;
  entity_map?: Record<string, string | null>;
  economics?: {
    today_kwh: number;
    today_pending_eur: number;
    tariff_primary?: Record<string, unknown> | null;
    tariffs_all?: Array<{
      id?: string | null;
      name?: string | null;
      currency?: string | null;
      price_per_kwh?: number | null;
    }>;
    reimbursement_history: unknown[];
    belgium_cap_compliant?: boolean | null;
  };
  diagnostics?: {
    api_partial: boolean;
    last_error?: string | null;
    installation_features?: unknown;
    charger_features_summary?: unknown;
    unsupported_connectors: unknown[];
    stale_sections: string[];
    installation_raw_excerpt: Record<string, unknown>;
    recent_session_errors: unknown[];
    session_json_keys_union?: string[] | null;
  };
  chargers_extended?: Array<{
    serial: string;
    load_balance: { reported: boolean; value?: unknown; source_key?: string };
  }>;
  overview_context?: {
    month_smart_savings: {
      total_eur: number;
      sessions_count: number;
      currency: string;
    };
    active_ev_hints: Array<{
      session_id: string;
      charger_serial: string;
      connector: number;
      status: string;
      connector_mode: string;
      pause_explanation: { code: string; title: string; detail: string };
      limit_chain: Array<{
        factor: string;
        label: string;
        value: string;
        source: "live" | "config" | "estimated";
      }>;
    }>;
  };
}

export type TabId =
  | "overview"
  | "chargers"
  | "sessions"
  | "economics"
  | "diagnostics";

export type ConnectionState =
  | "idle"
  | "loading"
  | "connected"
  | "error"
  | "reconnecting";
