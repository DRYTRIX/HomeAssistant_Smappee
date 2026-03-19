import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../types/panel.js";

function fmtRate(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
}

export function renderHealthTab(p: PanelPayload): TemplateResult {
  const health = p.health;
  const connections = health?.connection_status ?? {};
  const deviceLast = health?.device_last_data ?? {};
  const alerts = health?.alerts ?? [];
  const observability = p.diagnostics?.observability as
    | { recent_errors?: unknown[] }
    | undefined;

  return html`
    <div class="card">
      <h3 class="card-h">Pipeline health</h3>
      <p>Throughput: <strong>${fmtRate(health?.throughput_per_s)}</strong> items/s</p>
      <p>Error rate: <strong>${fmtRate(health?.error_rate_per_s)}</strong> errors/s</p>
    </div>
    <div class="card">
      <h3 class="card-h">Connections</h3>
      ${Object.keys(connections).length
        ? html`<ul>
            ${Object.entries(connections).map(
              ([k, v]) => html`<li><strong>${k}</strong>: ${String(v)}</li>`
            )}
          </ul>`
        : html`<p class="muted">No connection telemetry yet.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Last data by device</h3>
      ${Object.keys(deviceLast).length
        ? html`<ul>
            ${Object.entries(deviceLast).map(
              ([k, v]) => html`<li><strong>${k}</strong>: ${String(v)}</li>`
            )}
          </ul>`
        : html`<p class="muted">No device timestamps available.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Local alerts</h3>
      ${alerts.length
        ? html`<ul>
            ${alerts.map(
              (a) => html`
                <li>
                  <strong>${a.title ?? a.id}</strong> (${a.severity ?? "warning"}) -
                  ${a.message ?? ""}
                </li>
              `
            )}
          </ul>`
        : html`<p class="muted">No active alerts.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Recent errors</h3>
      <pre class="json-pre">${JSON.stringify(observability?.recent_errors ?? [], null, 2)}</pre>
    </div>
  `;
}

