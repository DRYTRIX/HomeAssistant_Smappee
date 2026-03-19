import { html, type TemplateResult } from "lit";
import type { HistoryPoint } from "../api/ws.js";

export function renderSparkline(
  points: HistoryPoint[] | undefined,
  label: string
): TemplateResult {
  if (!points?.length) {
    return html`<div class="spark-empty" aria-label=${label}>No trend data</div>`;
  }
  const w = 120;
  const h = 36;
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pad = 2;
  const path = points
    .map((p, i) => {
      const x =
        pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2);
      const y = pad + (1 - (p.v - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return html`
    <svg
      class="spark-svg"
      viewBox="0 0 ${w} ${h}"
      width="${w}"
      height="${h}"
      aria-label=${label}
    >
      <path
        d=${path}
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `;
}
