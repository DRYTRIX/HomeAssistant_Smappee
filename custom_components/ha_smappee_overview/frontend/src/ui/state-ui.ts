import { html, type TemplateResult } from "lit";
import type { DashboardUiState, WidgetStatus } from "../state/selectors.js";
import { formatIsoLocal } from "../state/selectors.js";

export function renderNoDataReceivedState(): TemplateResult {
  return html`
    <div class="state-card state-card-empty">
      <h3>No data received yet</h3>
      <p class="muted">Possible causes:</p>
      <ul class="state-cause-list">
        <li>No devices connected</li>
        <li>Wrong time range</li>
        <li>Data pipeline issue</li>
      </ul>
    </div>
  `;
}

export function renderStateError(state: DashboardUiState): TemplateResult {
  let msg = "Connection failed";
  if (state === "error_no_data_range") msg = "No data in selected range";
  if (state === "error_parsing") msg = "Parsing error";
  return html`<div class="state-card state-card-error"><strong>${msg}</strong></div>`;
}

export function renderWidgetSkeleton(lines = 3): TemplateResult {
  return html`
    <div class="widget-skel">
      ${Array.from({ length: lines }).map(
        () => html`<div class="skel skel-line"></div>`
      )}
    </div>
  `;
}

export function renderWidgetStatus(status: WidgetStatus): TemplateResult {
  const frClass =
    status.freshness === "live"
      ? "fresh-live"
      : status.freshness === "stale"
        ? "fresh-stale"
        : "fresh-offline";
  return html`
    <div class="widget-status-line muted small">
      <span>Last update: ${formatIsoLocal(status.lastUpdate)}</span>
      <span class="fresh-pill ${frClass}">${status.freshness}</span>
      <span>Source: ${status.source}</span>
    </div>
  `;
}
