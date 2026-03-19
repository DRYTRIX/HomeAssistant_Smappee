import { html, type TemplateResult } from "lit";
import type { WidgetStatus } from "../state/selectors.js";
import type { PanelPayload } from "../types/panel.js";
import { renderWidgetSkeleton, renderWidgetStatus } from "./state-ui.js";

export function renderDiagnosticsTab(
  p: PanelPayload,
  widgetStatus: WidgetStatus,
  debugMode = false,
  loading = false
): TemplateResult {
  const d = p.diagnostics;
  const inst = p.installation;
  const normalizeWarnings = p.__normalize_warnings ?? [];

  return html`
    ${renderWidgetStatus(widgetStatus)}
    ${loading ? renderWidgetSkeleton(2) : ""}
    <div class="card">
      <h3 class="card-h">API health</h3>
      <p>Coordinator OK: <strong>${p.meta?.coordinator_last_update_success ?? "—"}</strong></p>
      <p>Partial API: <strong>${p.api_partial ? "yes" : "no"}</strong></p>
      <p>Last error: <code>${p.last_error ?? d?.last_error ?? "—"}</code></p>
      <p>Update interval: ${p.meta?.update_interval_s ?? "—"}s</p>
      <p>Installation timezone: <code>${p.meta?.installation_timezone ?? "—"}</code></p>
    </div>
    <div class="card">
      <h3 class="card-h">Stale sections</h3>
      ${d?.stale_sections?.length
        ? html`<ul>${d.stale_sections.map((s) => html`<li>${s}</li>`)}</ul>`
        : html`<p class="muted">None flagged.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Unsupported / limited features</h3>
      ${d?.unsupported_connectors?.length
        ? html`<ul>
            ${d.unsupported_connectors.map((u) => {
              const x = u as {
                charger_serial?: string;
                connector?: number;
                reason?: string;
              };
              return html`<li>${x.charger_serial} #${x.connector}: ${x.reason}</li>`;
            })}
          </ul>`
        : html`<p class="muted">None listed.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Installation</h3>
      <pre class="json-pre">${JSON.stringify(inst, null, 2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Installation raw (excerpt)</h3>
      <pre class="json-pre">${JSON.stringify(d?.installation_raw_excerpt ?? {}, null, 2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Data Inspector</h3>
      <p class="muted small">
        Raw incoming + processed snapshots and render eligibility hints.
      </p>
      <pre class="json-pre">${JSON.stringify(
        {
          normalizeWarnings,
          backendHealth: d?.backend_health ?? {},
          validationWarnings: d?.validation_warnings ?? [],
          hasConsumption: Boolean(p.consumption),
          chargers: p.chargers?.length ?? 0,
          sessionsActive: p.sessions_active?.length ?? 0,
          sessionsRecent: p.sessions_recent?.length ?? 0,
          apiPartial: p.api_partial ?? false,
          timeWindowUtc: p.meta?.time_window_today_utc ?? null,
        },
        null,
        2
      )}</pre>
    </div>
    ${d?.session_json_keys_union?.length
      ? html`
          <div class="card">
            <h3 class="card-h">Session JSON keys (debug)</h3>
            <p class="muted small">
              Enable &quot;Debug session JSON keys&quot; in integration options. Union of keys seen in
              recent session payloads.
            </p>
            <pre class="json-pre">${JSON.stringify(d.session_json_keys_union, null, 2)}</pre>
          </div>
        `
      : ""}
    ${debugMode && p.advanced
      ? html`
          <div class="card">
            <h3 class="card-h">Advanced Raw Excerpts (Debug mode)</h3>
            <pre class="json-pre">${JSON.stringify(p.advanced.raw_excerpts ?? {}, null, 2)}</pre>
          </div>
        `
      : ""}
  `;
}
