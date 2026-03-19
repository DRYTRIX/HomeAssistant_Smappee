import { html, type TemplateResult } from "lit";

export function renderEmptyState(
  title: string,
  body: string,
  actionLabel?: string,
  onAction?: () => void
): TemplateResult {
  return html`
    <div class="sov-empty">
      <div class="sov-empty-title">${title}</div>
      <p class="sov-empty-body muted">${body}</p>
      ${actionLabel && onAction
        ? html`<button type="button" class="btn secondary" @click=${onAction}>
            ${actionLabel}
          </button>`
        : ""}
    </div>
  `;
}
