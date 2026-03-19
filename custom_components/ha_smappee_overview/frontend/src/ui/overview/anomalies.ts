import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../../types/panel.js";
import { selectBelgiumCapOk } from "../../state/selectors.js";

export interface AnomalyItem {
  id: string;
  severity: "error" | "warn" | "info";
  label: string;
}

export function collectAnomalies(p: PanelPayload): AnomalyItem[] {
  const items: AnomalyItem[] = [];

  if (p.api_partial) {
    items.push({
      id: "api-partial",
      severity: "warn",
      label: "Partial API data",
    });
  }
  if (p.consumption?.stale || p.meta?.consumption_stale) {
    items.push({
      id: "consumption-stale",
      severity: "warn",
      label: "Consumption stale",
    });
  }
  if (!p.meta?.coordinator_last_update_success) {
    items.push({
      id: "coord-fail",
      severity: "error",
      label: "Last update failed",
    });
  }

  const be = selectBelgiumCapOk(p);
  if (p.country_code === "BE" && be === false) {
    items.push({
      id: "be-cap",
      severity: "error",
      label: "BE cap exceeded",
    });
  }

  const unsupported = p.diagnostics?.unsupported_connectors ?? [];
  for (let i = 0; i < unsupported.length; i++) {
    const u = unsupported[i] as { charger_serial?: string; connector?: number };
    items.push({
      id: `unsupported-${i}`,
      severity: "info",
      label: `Mode unknown · ${u.charger_serial ?? "?"} #${u.connector ?? "?"}`,
    });
  }

  for (const a of p.alerts ?? []) {
    const sev =
      (a.severity || "").toLowerCase() === "error"
        ? "error"
        : (a.severity || "").toLowerCase() === "warning"
          ? "warn"
          : "info";
    items.push({
      id: `alert-${a.id}`,
      severity: sev,
      label: a.message.slice(0, 80) + (a.message.length > 80 ? "…" : ""),
    });
  }

  return items.slice(0, 12);
}

export function renderAnomalyBadges(items: AnomalyItem[]): TemplateResult {
  if (!items.length) {
    return html`
      <div class="sov-anomalies sov-anomalies--ok">
        <span class="sov-anomaly sov-anomaly--ok">No anomalies flagged</span>
      </div>
    `;
  }
  return html`
    <div class="sov-anomalies">
      ${items.map(
        (x) => html`
          <span class="sov-anomaly sov-anomaly--${x.severity}" title=${x.label}
            >${x.label}</span
          >
        `
      )}
    </div>
  `;
}
