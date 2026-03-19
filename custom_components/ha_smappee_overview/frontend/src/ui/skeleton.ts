import { html, type TemplateResult } from "lit";

export function renderPageSkeleton(): TemplateResult {
  return html`
    <div class="skel-layout">
      <div class="skel skel-line skel-title"></div>
      <div class="skel skel-line" style="width:60%"></div>
      <div class="skel-grid">
        ${[1, 2, 3, 4].map(
          () => html`<div class="skel skel-card"></div>`
        )}
      </div>
    </div>
  `;
}
