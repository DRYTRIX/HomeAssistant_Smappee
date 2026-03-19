import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../types/panel.js";

export function renderDiagnosticsTab(p: PanelPayload): TemplateResult {
  const d = p.diagnostics;
  const inst = p.installation;

  return html`
    <div class="card">
      <h3 class="card-h">API health</h3>
      <p>Coordinator OK: <strong>${p.meta?.coordinator_last_update_success ?? "—"}</strong></p>
      <p>Partial API: <strong>${p.api_partial ? "yes" : "no"}</strong></p>
      <p>Last error: <code>${p.last_error ?? d?.last_error ?? "—"}</code></p>
      <p>Update interval: ${p.meta?.update_interval_s ?? "—"}s</p>
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
  `;
}
