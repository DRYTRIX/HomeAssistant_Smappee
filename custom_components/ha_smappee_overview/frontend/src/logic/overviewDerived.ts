import { selectFlowSummary } from "../state/selectors.js";
import type {
  PanelPayload,
  PanelConsumption,
} from "../types/panel.js";

export type MetricSource = "live" | "calculated" | "estimated" | "missing";

export interface DerivedMetric {
  value: string;
  numeric: number | null;
  source: MetricSource;
  tooltip: string;
}

export interface OperationalBadge {
  id: string;
  label: string;
  active: boolean;
  variant: "ok" | "warn" | "info" | "neutral";
  title: string;
}

export interface FlowEdge {
  id: string;
  from: "grid" | "solar" | "battery" | "ev" | "home";
  to: "home" | "grid";
  powerW: number | null;
  kind: "import" | "export" | "solar" | "battery" | "ev";
}

export interface FlowNodeState {
  id: string;
  label: string;
  powerW: number | null;
  sub?: string;
}

function fmtPower(w: number | null | undefined): string {
  if (w == null || Number.isNaN(w)) return "—";
  return `${Math.round(w)} W`;
}

/** Primary user-facing charging limit / pause reason from API hint. */
export function chargingReasonFromHint(hint: {
  pause_explanation: { code: string; title: string; detail: string };
  limit_chain: Array<{ factor: string; label: string; value: string }>;
  status: string;
  connector_mode: string;
}): { short: string; detail: string } {
  const code = hint.pause_explanation.code;
  if (code !== "charging") {
    return {
      short: hint.pause_explanation.title,
      detail: hint.pause_explanation.detail,
    };
  }
  const chain = hint.limit_chain ?? [];
  const loadB = chain.find((s) => s.factor === "load_balance");
  if (loadB) {
    return {
      short: "Limited by load balancing / grid",
      detail: `${loadB.label}: ${loadB.value}. The installation may be capping current to protect the main fuse or tariff.`,
    };
  }
  const smart = chain.find((s) => s.factor === "smart_mode");
  if (smart) {
    return {
      short: "Smart mode may throttle",
      detail: smart.value,
    };
  }
  const setC = chain.find((s) => s.factor === "set_current");
  if (setC) {
    return {
      short: "User current limit",
      detail: `${setC.label}: ${setC.value}.`,
    };
  }
  return {
    short: "Charging",
    detail: "Energy is being delivered when the vehicle accepts it.",
  };
}

export function buildOperationalBadges(p: PanelPayload): OperationalBadge[] {
  const flags = p.overview_context?.operational_flags;
  const out: OperationalBadge[] = [];

  out.push({
    id: "charging",
    label: "Charging active",
    active: Boolean(flags?.charging_active),
    variant: flags?.charging_active ? "ok" : "neutral",
    title: flags?.charging_active
      ? "At least one session is delivering or queued with current."
      : "No active charging detected on connectors.",
  });

  out.push({
    id: "overload",
    label: "Load cap / balance",
    active: Boolean(flags?.overload_suspected),
    variant: flags?.overload_suspected ? "warn" : "neutral",
    title: flags?.overload_suspected
      ? "Load balancing or similar may be limiting available current."
      : "No load-balancing cap detected from API hints.",
  });

  out.push({
    id: "solar_surplus",
    label: "Solar surplus",
    active: Boolean(flags?.solar_surplus),
    variant: flags?.solar_surplus ? "info" : "neutral",
    title: flags?.solar_surplus
      ? "Significant export to grid — surplus power available."
      : "Export is low or unknown.",
  });

  out.push({
    id: "smart",
    label: "Smart charging",
    active: Boolean(flags?.smart_mode_any),
    variant: flags?.smart_mode_any ? "info" : "neutral",
    title: flags?.smart_mode_any
      ? "At least one connector uses SMART mode."
      : "No connector in SMART mode.",
  });

  out.push({
    id: "solar_mode",
    label: "Solar mode",
    active: Boolean(flags?.solar_mode_any),
    variant: flags?.solar_mode_any ? "info" : "neutral",
    title: flags?.solar_mode_any
      ? "Solar-oriented charging mode reported by the API."
      : "Solar-specific mode not reported.",
  });

  return out;
}

export function buildFlowModel(p: PanelPayload): {
  nodes: FlowNodeState[];
  edges: FlowEdge[];
  hasConsumption: boolean;
} {
  const c = p.consumption;
  if (!c) {
    return { nodes: [], edges: [], hasConsumption: false };
  }
  const f = selectFlowSummary(p);
  const evW = p.overview_context?.estimated_ev_power_w ?? null;

  const nodes: FlowNodeState[] = [
    {
      id: "grid",
      label: "Grid",
      powerW: f.gridImport != null && f.gridImport > 0 ? f.gridImport : null,
      sub:
        f.gridExport != null && f.gridExport > 0
          ? `Export ${fmtPower(f.gridExport)}`
          : undefined,
    },
    {
      id: "solar",
      label: "Solar",
      powerW: f.solar,
    },
    {
      id: "home",
      label: "Home",
      powerW: f.home,
    },
    {
      id: "battery",
      label: "Battery",
      powerW: f.battery,
      sub:
        f.batterySoc != null ? `${Math.round(f.batterySoc)}% SoC` : undefined,
    },
    {
      id: "ev",
      label: "EV",
      powerW: evW,
      sub: evW != null ? "estimated" : undefined,
    },
  ];

  const edges: FlowEdge[] = [];
  if (f.gridImport != null && f.gridImport > 0) {
    edges.push({
      id: "grid-in",
      from: "grid",
      to: "home",
      powerW: f.gridImport,
      kind: "import",
    });
  }
  if (f.gridExport != null && f.gridExport > 0) {
    edges.push({
      id: "grid-out",
      from: "home",
      to: "grid",
      powerW: f.gridExport,
      kind: "export",
    });
  }
  if (f.solar != null && f.solar > 0) {
    edges.push({
      id: "solar-in",
      from: "solar",
      to: "home",
      powerW: f.solar,
      kind: "solar",
    });
  }
  if (f.battery != null && Math.abs(f.battery) > 5) {
    edges.push({
      id: "battery",
      from: "battery",
      to: "home",
      powerW: f.battery,
      kind: "battery",
    });
  }
  if (evW != null && evW > 0) {
    edges.push({
      id: "ev",
      from: "ev",
      to: "home",
      powerW: evW,
      kind: "ev",
    });
  }

  return { nodes, edges, hasConsumption: true };
}

function tariffPrimary(
  p: PanelPayload
): { price: number | null; currency: string } {
  const tp = p.economics?.tariff_primary as
    | { price_per_kwh?: number | null; currency?: string | null }
    | null
    | undefined;
  const cur =
    (tp?.currency as string) ||
    (p.tariffs?.[0]?.currency as string) ||
    "EUR";
  const price =
    typeof tp?.price_per_kwh === "number" ? tp.price_per_kwh : null;
  return { price, currency: cur };
}

export function buildOverviewKpis(p: PanelPayload): {
  consumption: DerivedMetric;
  solar: DerivedMetric;
  evPower: DerivedMetric;
  tariff: DerivedMetric;
  todayCost: DerivedMetric;
  selfConsumption: DerivedMetric;
} {
  const c = p.consumption;
  const { price, currency } = tariffPrimary(p);
  const todayCost = p.economics?.today_charging_cost_estimate_eur;
  const evW = p.overview_context?.estimated_ev_power_w;

  return {
    consumption: {
      value: fmtPower(c?.consumption_w),
      numeric: c?.consumption_w ?? null,
      source: c?.consumption_w != null ? "live" : "missing",
      tooltip:
        "Total site consumption (live). Sparkline from Home Assistant history when entity mapping exists.",
    },
    solar: {
      value: fmtPower(c?.solar_w),
      numeric: c?.solar_w ?? null,
      source: c?.solar_w != null ? "live" : "missing",
      tooltip: "Solar production (live).",
    },
    evPower: {
      value: fmtPower(evW ?? undefined),
      numeric: evW ?? null,
      source: evW != null ? "estimated" : "missing",
      tooltip:
        "Estimated from connector current × phase voltage (or 230 V fallback). Not a direct meter reading.",
    },
    tariff: {
      value:
        price != null
          ? `${price.toFixed(4)} ${currency}/kWh`
          : "—",
      numeric: price,
      source: price != null ? "calculated" : "missing",
      tooltip:
        "Primary tariff from Smappee API (first in list). Used for session cost estimates.",
    },
    todayCost: {
      value:
        todayCost != null
          ? `≈ ${todayCost.toFixed(2)} ${currency}`
          : "—",
      numeric: todayCost ?? null,
      source: todayCost != null ? "calculated" : "missing",
      tooltip:
        "Sum of primary-tariff estimates for sessions that started today (UTC). Not a utility bill.",
    },
    selfConsumption: {
      value:
        c?.self_consumption_pct != null
          ? `${Math.round(c.self_consumption_pct)}%`
          : "—",
      numeric: c?.self_consumption_pct ?? null,
      source: c?.self_consumption_pct != null ? "live" : "missing",
      tooltip: "Self-consumption share from the last consumption snapshot.",
    },
  };
}

export function maxPhaseCurrentA(c: PanelConsumption | null | undefined): number | null {
  if (!c?.phase_metrics) return null;
  const pm = c.phase_metrics;
  const vals = [pm.l1_a, pm.l2_a, pm.l3_a].filter(
    (x): x is number => typeof x === "number" && Number.isFinite(x)
  );
  if (!vals.length) return null;
  return Math.max(...vals);
}
