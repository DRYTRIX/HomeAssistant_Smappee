import { html, type TemplateResult } from "lit";
import type { PanelPayload } from "../../types/panel.js";
import type { ConnectionState } from "../../types/panel.js";
import { renderLineageBadge } from "./data-lineage-badge.js";

export function renderHealthStrip(
  p: PanelPayload,
  connection: ConnectionState,
  historyLoading: boolean,
  entityMapPresent: boolean,
  onRefresh?: () => void
): TemplateResult {
  const meta = p.meta;
  const stale = p.diagnostics?.stale_sections ?? [];
  const coordOk = meta?.coordinator_last_update_success !== false;
  const parts: TemplateResult[] = [];

  parts.push(html`
    <div class="sov-health-item">
      ${renderLineageBadge("live")}
      <span class="sov-health-label">Coordinator</span>
      <strong class=${coordOk ? "ok-text" : "warn-text"}
        >${coordOk ? "OK" : "Issue"}</strong
      >
    </div>
  `);

  parts.push(html`
    <div class="sov-health-item">
      <span class="sov-health-label">Connection</span>
      <strong
        >${connection === "connected"
          ? "Connected"
          : connection === "loading"
            ? "Loading…"
            : connection === "error"
              ? "Error"
              : "Idle"}</strong
      >
    </div>
  `);

  if (p.last_successful_update) {
    parts.push(html`
      <div class="sov-health-item">
        <span class="sov-health-label">Last sync</span>
        <span class="mono small"
          >${p.last_successful_update.replace("T", " ").slice(0, 19)}Z</span
        >
      </div>
    `);
  }

  if (stale.length) {
    parts.push(html`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Stale</span>
        <span>${stale.join(", ")}</span>
      </div>
    `);
  }

  if (p.api_partial) {
    parts.push(html`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">API</span>
        <span>Partial</span>
      </div>
    `);
  }

  if (!entityMapPresent) {
    parts.push(html`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Trends</span>
        <span>No entity map</span>
      </div>
    `);
  } else if (historyLoading) {
    parts.push(html`
      <div class="sov-health-item">
        <span class="sov-health-label">Trends</span>
        <span class="sov-shimmer">Loading history…</span>
      </div>
    `);
  }

  return html`
    <div class="sov-health-strip">
      ${parts}
      ${onRefresh
        ? html`<button
            type="button"
            class="btn secondary sov-health-refresh"
            @click=${onRefresh}
          >
            Refresh
          </button>`
        : ""}
    </div>
  `;
}
