/** Panel WebSocket payload (v1 + v2). */

export interface PanelMeta {
  schema_version: number;
  update_interval_s: number;
  coordinator_last_update_success: boolean;
  consumption_stale: boolean;
  advanced_panel_allowed?: boolean;
  advanced_data_included?: boolean;
}

export interface PanelPhaseMetrics {
  l1_v?: number | null;
  l2_v?: number | null;
  l3_v?: number | null;
  l1_a?: number | null;
  l2_a?: number | null;
  l3_a?: number | null;
  l1_w?: number | null;
  l2_w?: number | null;
  l3_w?: number | null;
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
  phase_metrics?: PanelPhaseMetrics | null;
  submeters?: Array<{
    id?: string | number | null;
    name?: string | null;
    power_w?: number | null;
    energy_wh?: number | null;
  }>;
  always_on_w?: number | null;
  gas_m3?: number | null;
  water_m3?: number | null;
}

export interface PanelAdvancedPayload {
  coordinator_state: {
    config_entry_id: string;
    last_update_success: boolean;
    last_exception: string | null;
    handling_update: boolean | null;
    last_successful_update: string | null;
    update_interval_s: number;
  };
  raw_excerpts: {
    sessions: Array<{
      id: string;
      charger_serial: string;
      connector: number;
      excerpt: Record<string, unknown>;
    }>;
    chargers: Array<{ serial: string; excerpt: Record<string, unknown> }>;
    consumption: Record<string, unknown>;
  };
  session_json_keys_union: string[];
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
  duration_s?: number | null;
}

export interface PanelChargingExplanation {
  status: string;
  reason: string;
  message: string;
  details: Record<string, unknown>;
  badge: { label: string; tone: "info" | "warn" | "neutral" };
  suggestions: Array<{ id: string; label: string }>;
  technical: {
    limit_chain: Array<{
      factor: string;
      label: string;
      value: string;
      source: "live" | "config" | "estimated";
    }>;
    pause_code: string;
    signals: Record<string, unknown>;
  };
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

/** Backend energy_intelligence block (schema_version 1). */
export interface PanelEnergyIntelligence {
  schema_version: number;
  currency: string;
  boundaries: string;
  costs: {
    primary_tariff_per_kwh?: number | null;
    realtime_estimate_eur_per_h?: number | null;
    realtime_power_estimate_w?: number | null;
    charging_power_assumption?: { line_voltage_v: number; phases: number };
    active_sessions_cost_sum?: number | null;
    active_sessions_count?: number;
    today: { kwh: number; cost: number };
    month: {
      key: string;
      kwh: number;
      cost: number;
      cost_from_api?: number | null;
      cost_from_estimate?: number | null;
    };
    daily_series: Array<{ date: string; kwh: number; cost: number }>;
  };
  smart_charging: {
    month_key: string;
    sessions_in_scope: number;
    counterfactual_flat_grid_eur: number;
    actual_cost_preferred_eur: number;
    savings_eur: number;
    savings_raw_eur: number;
    method: string;
  };
  solar_ev: {
    month_key: string;
    weighted_solar_pct?: number | null;
    solar_kwh?: number | null;
    grid_kwh?: number | null;
    unknown_solar_kwh?: number | null;
    month_ev_kwh?: number | null;
  };
  reimbursement: {
    month_key: string;
    currency: string;
    completed: { kwh: number; amount: number };
    in_progress: { kwh: number; amount: number };
    other: { kwh: number; amount: number };
    sessions_preview: Array<Record<string, unknown>>;
  };
  capacity_be: {
    enabled: boolean;
    contract_kw?: number | null;
    warn_pct?: number | null;
    peak_kw_sampled?: number | null;
    sample_count?: number | null;
    method?: string | null;
    unavailable_reason?: string | null;
    utilization_pct?: number | null;
    warning_level?: string | null;
    annual_impact_estimate_eur?: number | null;
  };
  insights: Array<{ id: string; severity: string; body: string }>;
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
    today_charging_cost_estimate_eur?: number | null;
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
  energy_intelligence?: PanelEnergyIntelligence | null;
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
  discovery?: PanelDiscovery | null;
  advanced?: PanelAdvancedPayload | null;
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
      explanation?: PanelChargingExplanation;
    }>;
    connector_explanations?: Array<{
      charger_serial: string;
      connector: number;
      explanation: PanelChargingExplanation;
    }>;
    operational_flags?: {
      charging_active?: boolean;
      smart_mode_any?: boolean;
      solar_mode_any?: boolean;
      overload_suspected?: boolean;
      solar_surplus?: boolean;
    };
    estimated_ev_power_w?: number | null;
    peak_phase_current_warning_a?: number | null;
    assistant_suggestions?: Array<{
      id: string;
      category?: string;
      severity: "info" | "warn";
      title: string;
      body: string;
      savings?: {
        amount: number;
        currency: string;
        assumed_kwh: number;
        note: string;
      };
    }>;
  };
}

export interface PanelDiscoveryNode {
  id: string;
  kind: string;
  label: string;
  serial?: string | null;
  parent_serial?: string | null;
  source_sl_devices?: boolean;
  source_charging_api?: boolean;
  availability?: boolean | null;
  connector_count?: number | null;
  health: {
    connectivity: string;
    last_seen_iso?: string | null;
    api_last_seen_iso?: string | null;
  };
}

export interface PanelDiscovery {
  partial?: boolean;
  notes?: string[];
  sources?: Record<string, boolean>;
  generated_at?: string | null;
  edges?: Array<{ parent: string; child: string }>;
  nodes?: PanelDiscoveryNode[];
  summary?: Record<string, number>;
  consumption_stale_hint?: boolean;
}

export type TabId =
  | "overview"
  | "devices"
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
