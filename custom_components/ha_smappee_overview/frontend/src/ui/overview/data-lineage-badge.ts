import { html, type TemplateResult } from "lit";

export type LineageKind = "live" | "calculated" | "config";

const LABELS: Record<LineageKind, string> = {
  live: "Live",
  calculated: "Calculated",
  config: "Config",
};

const TITLES: Record<LineageKind, string> = {
  live: "Directly from Smappee (real-time or latest connector state).",
  calculated:
    "Derived in this integration from sessions, tariffs, or history—not a utility invoice.",
  config: "From your integration options or Smappee tariff settings.",
};

export function renderLineageBadge(
  kind: LineageKind,
  extraTitle?: string
): TemplateResult {
  const tip = extraTitle ? `${TITLES[kind]} ${extraTitle}` : TITLES[kind];
  return html`
    <span class="sov-badge sov-badge--${kind}" title=${tip}>${LABELS[kind]}</span>
  `;
}
