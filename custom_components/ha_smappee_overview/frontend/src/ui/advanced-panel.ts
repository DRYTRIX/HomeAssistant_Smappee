import { html, nothing, type TemplateResult } from "lit";
import type { PanelPayload } from "../types/panel.js";

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return String(v);
}

export function renderAdvancedPanel(p: PanelPayload): TemplateResult {
  const meta = p.meta;
  const allowed = meta?.advanced_panel_allowed === true;
  const included = meta?.advanced_data_included === true;
  const adv = p.advanced;
  const pm = p.consumption?.phase_metrics;
  const subs = p.consumption?.submeters ?? [];
  const hints = p.overview_context?.active_ev_hints ?? [];
  const ext = p.chargers_extended ?? [];

  return html`
    <div class="card advanced-region">
      <h3 class="card-h">Advanced</h3>
      ${!allowed
        ? html`<p class="muted">
            Turn on <strong>Allow advanced panel data</strong> in the integration options
            (Configure → Smappee Overview), then reload the panel.
          </p>`
        : html`
            ${!included
              ? html`<p class="muted small">
                  Raw excerpts and coordinator debug load on the next fetch. Click
                  <strong>Refresh</strong> if needed.
                </p>`
              : nothing}
            <details class="adv-details" open>
              <summary>Phase &amp; submeters</summary>
              ${pm
                ? html`
                    <table class="adv-table mono small">
                      <tbody>
                        <tr>
                          <td>L1</td>
                          <td>${fmt(pm.l1_v)} V</td>
                          <td>${fmt(pm.l1_a)} A</td>
                          <td>${fmt(pm.l1_w)} W</td>
                        </tr>
                        <tr>
                          <td>L2</td>
                          <td>${fmt(pm.l2_v)} V</td>
                          <td>${fmt(pm.l2_a)} A</td>
                          <td>${fmt(pm.l2_w)} W</td>
                        </tr>
                        <tr>
                          <td>L3</td>
                          <td>${fmt(pm.l3_v)} V</td>
                          <td>${fmt(pm.l3_a)} A</td>
                          <td>${fmt(pm.l3_w)} W</td>
                        </tr>
                      </tbody>
                    </table>
                  `
                : html`<p class="muted small">No phase metrics on consumption.</p>`}
              ${subs.length
                ? html`
                    <p class="small"><strong>Submeters</strong></p>
                    <ul class="small">
                      ${subs.map(
                        (s) =>
                          html`<li>
                            ${s.name ?? s.id}: ${fmt(s.power_w)} W
                            ${s.energy_wh != null
                              ? html` / ${fmt(s.energy_wh)} Wh`
                              : nothing}
                          </li>`
                      )}
                    </ul>
                  `
                : html`<p class="muted small">No submeters in payload.</p>`}
            </details>
            <details class="adv-details" open>
              <summary>Internal limits &amp; load balance</summary>
              ${hints.length
                ? hints.map(
                    (h) => html`
                      <div class="adv-hint small">
                        <strong>${h.charger_serial}</strong> #${h.connector} —
                        ${h.status} / ${h.connector_mode}
                        ${h.limit_chain?.length
                          ? html`<ul>
                              ${h.limit_chain.map(
                                (lc) =>
                                  html`<li>
                                    ${lc.label}: ${lc.value}
                                    <span class="muted">(${lc.factor})</span>
                                  </li>`
                              )}
                            </ul>`
                          : html`<p class="muted">No limit chain.</p>`}
                      </div>
                    `
                  )
                : html`<p class="muted small">No active EV hints.</p>`}
              <p class="small"><strong>chargers_extended</strong></p>
              <pre class="json-pre">${JSON.stringify(ext, null, 2)}</pre>
            </details>
          `}
      ${allowed && included && adv
        ? html`
            <details class="adv-details">
              <summary>Raw API excerpts</summary>
              <pre class="json-pre">${JSON.stringify(adv.raw_excerpts, null, 2)}</pre>
            </details>
            <details class="adv-details">
              <summary>Debug</summary>
              <p class="small">
                Stale: ${(p.diagnostics?.stale_sections ?? []).join(", ") || "—"}
              </p>
              <p class="small">Unsupported connectors</p>
              <pre class="json-pre">${JSON.stringify(
                p.diagnostics?.unsupported_connectors ?? [],
                null,
                2
              )}</pre>
              <p class="small">Session JSON keys (union)</p>
              <pre class="json-pre">${JSON.stringify(
                adv.session_json_keys_union,
                null,
                2
              )}</pre>
            </details>
            <details class="adv-details">
              <summary>Coordinator state</summary>
              <pre class="json-pre">${JSON.stringify(
                adv.coordinator_state,
                null,
                2
              )}</pre>
            </details>
          `
        : nothing}
    </div>
  `;
}
