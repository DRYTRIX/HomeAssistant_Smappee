import { html, type TemplateResult } from "lit";
import { buildOperationalBadges } from "../../logic/overviewDerived.js";
import type { PanelPayload } from "../../types/panel.js";

export function renderStatusBadges(p: PanelPayload): TemplateResult {
  const badges = buildOperationalBadges(p);
  return html`
    <section class="sov-status-strip" aria-label="Operational status">
      <div class="sov-status-badges">
        ${badges.map(
          (b) => html`
            <span
              class="sov-op-badge sov-op-badge--${b.variant} ${b.active
                ? "sov-op-badge--on"
                : ""}"
              title=${b.title}
              >${b.label}${b.active ? " · on" : ""}</span
            >
          `
        )}
      </div>
    </section>
  `;
}
