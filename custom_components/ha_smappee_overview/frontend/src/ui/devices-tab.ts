import { html, type TemplateResult } from "lit";
import type {
  PanelDiscoveryNode,
  PanelPayload,
} from "../types/panel.js";
import type { WidgetStatus } from "../state/selectors.js";
import {
  renderNoDataReceivedState,
  renderWidgetSkeleton,
  renderWidgetStatus,
} from "./state-ui.js";

const MAX_TREE_DEPTH = 14;

const KIND_ORDER = [
  "installation",
  "gateway",
  "monitor",
  "charger",
  "unknown",
];

function formatSeen(n: PanelDiscoveryNode): string {
  const api = n.health?.api_last_seen_iso;
  if (api) return `Cloud: ${api.slice(0, 19).replace("T", " ")}`;
  const ls = n.health?.last_seen_iso;
  if (ls) return `Observed: ${ls.slice(0, 19).replace("T", " ")}`;
  return "";
}

function sourceLine(n: PanelDiscoveryNode): string {
  const p: string[] = [];
  if (n.source_sl_devices) p.push("service location");
  if (n.source_charging_api) p.push("charging API");
  return p.length ? p.join(" · ") : "—";
}

function connectivityPillClass(c: string): string {
  if (c === "ok") return "ok";
  if (c === "offline") return "err";
  if (c === "stale") return "load";
  return "";
}

function renderNodeRow(n: PanelDiscoveryNode, depth: number): TemplateResult {
  const h = n.health?.connectivity ?? "unknown";
  const pad = Math.min(depth, 10) * 16;
  return html`
    <div
      class="dev-node-row"
      style=${`padding-left:${pad}px;border-left:${depth > 0 ? "2px solid var(--divider-color)" : "none"};margin-left:${depth > 0 ? "6px" : "0"}`}
    >
      <div class="dev-node-main">
        <span class="dev-node-label">${n.label}</span>
        <span class="pill small ${connectivityPillClass(h)}">${h}</span>
      </div>
      <div class="dev-node-detail muted small">
        <span>${n.kind}</span>
        ${n.serial ? html`<code>${n.serial}</code>` : ""}
        ${n.connector_count != null && n.connector_count > 0
          ? html`<span>${n.connector_count} connector(s)</span>`
          : ""}
        ${n.availability != null
          ? html`<span>Public: ${n.availability ? "yes" : "no"}</span>`
          : ""}
      </div>
      <div class="dev-node-meta muted small">
        <span>${formatSeen(n)}</span>
        <span>Sources: ${sourceLine(n)}</span>
      </div>
    </div>
  `;
}

function walkTree(
  id: string,
  depth: number,
  byId: Map<string, PanelDiscoveryNode>,
  children: Map<string, string[]>,
  seen: Set<string>
): TemplateResult[] {
  if (depth > MAX_TREE_DEPTH) return [];
  const n = byId.get(id);
  if (!n) return [];
  seen.add(id);
  const bits: TemplateResult[] = [renderNodeRow(n, depth)];
  for (const c of children.get(id) ?? []) {
    bits.push(...walkTree(c, depth + 1, byId, children, seen));
  }
  return bits;
}

export function renderDevicesTab(
  p: PanelPayload,
  widgetStatus: WidgetStatus,
  loading = false
): TemplateResult {
  const disc = p.discovery;
  const nodes = disc?.nodes ?? [];
  if (!disc || !nodes.length) {
    return html`
      ${renderWidgetStatus(widgetStatus)}
      <div class="card">
        <h3 class="card-h">Devices</h3>
        ${renderNoDataReceivedState()}
      </div>
    `;
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = disc.edges ?? [];
  const children = new Map<string, string[]>();
  for (const e of edges) {
    const list = children.get(e.parent) ?? [];
    list.push(e.child);
    children.set(e.parent, list);
  }

  const childEdgeIds = new Set(edges.map((e) => e.child));
  const parentEdgeIds = new Set(edges.map((e) => e.parent));
  const structuralRoots = [...parentEdgeIds].filter((p) => !childEdgeIds.has(p));

  const rootId =
    nodes.find((n) => n.kind === "installation")?.id ??
    nodes.find((n) => n.id.startsWith("installation:"))?.id ??
    structuralRoots[0] ??
    null;

  const seenInTree = new Set<string>();
  const treeRows =
    rootId && edges.length
      ? walkTree(rootId, 0, byId, children, seenInTree)
      : [];

  const unplaced = nodes.filter((n) => !seenInTree.has(n.id));
  const toGroup = edges.length === 0 ? nodes : unplaced;
  const groups = new Map<string, PanelDiscoveryNode[]>();
  for (const n of toGroup) {
    const k = n.kind || "unknown";
    const g = groups.get(k) ?? [];
    g.push(n);
    groups.set(k, g);
  }

  const summary = disc.summary ?? {};
  const metaOk = p.meta?.coordinator_last_update_success !== false;

  return html`
    ${renderWidgetStatus(widgetStatus)}
    ${loading ? renderWidgetSkeleton(2) : ""}
    <div class="devices-root">
      ${disc.partial || disc.notes?.length
        ? html`
            <div class="banner ${disc.partial ? "warn" : ""}">
              ${disc.partial
                ? html`<strong>Limited discovery.</strong> Topology may be incomplete when the API
                    does not expose hardware device lists.`
                : ""}
              ${disc.notes?.map((n) => html`<div>${n}</div>`)}
              <div class="muted small">
                Contributors: capture redacted <code>GET …/servicelocation</code> JSON — see
                <code>docs/API_CAPTURE.md</code>.
              </div>
            </div>
          `
        : ""}
      ${disc.consumption_stale_hint
        ? html`
            <div class="banner warn">
              Energy snapshot is stale; installation-level connectivity may be degraded.
            </div>
          `
        : ""}
      <div class="sov-health-strip" style="margin-bottom:14px">
        <div class="sov-health-item">
          <span class="sov-health-label">Coordinator</span>
          <span class="${metaOk ? "sov-health-ok" : "sov-health-warn"}"
            >${metaOk ? "OK" : "Issues"}</span
          >
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">OK</span>
          <strong>${summary.ok ?? 0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Offline</span>
          <strong>${summary.offline ?? 0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Stale</span>
          <strong>${summary.stale ?? 0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Unknown</span>
          <strong>${summary.unknown ?? 0}</strong>
        </div>
      </div>

      ${treeRows.length
        ? html`
            <div class="card">
              <h3 class="card-h">Topology</h3>
              <p class="muted small">
                Parent/child links come from the API when available; otherwise use the grouped list
                below.
              </p>
              <div class="dev-tree">${treeRows}</div>
            </div>
          `
        : ""}

      <div class="card">
        <h3 class="card-h">Network overview</h3>
        ${!edges.length
          ? html`<p class="muted small">No edges in API data — grouped by device kind.</p>`
          : unplaced.length
            ? html`<p class="muted small">Nodes not reached from the installation root:</p>`
            : ""}
        ${!edges.length
          ? KIND_ORDER.filter((k) => groups.has(k)).map(
              (k) => html`
                <h4 class="dev-kind-head">${k}</h4>
                ${(groups.get(k) ?? []).map((n) => renderNodeRow(n, 0))}
              `
            )
          : unplaced.length
            ? unplaced.map((n) => renderNodeRow(n, 0))
            : treeRows.length
              ? html`<p class="muted small">All nodes are in the tree above.</p>`
              : html`<p class="muted small">No nodes.</p>`}
      </div>

      ${disc.sources && Object.keys(disc.sources).length
        ? html`
            <div class="card">
              <h3 class="card-h">Data sources</h3>
              <ul class="dev-sources">
                ${Object.entries(disc.sources).map(
                  ([k, v]) => html`<li><code>${k}</code>: ${v ? "yes" : "no"}</li>`
                )}
              </ul>
            </div>
          `
        : ""}
    </div>
    <style>
      .devices-root {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dev-node-row {
        padding: 10px 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      .dev-node-row:last-child {
        border-bottom: none;
      }
      .dev-node-main {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .dev-node-label {
        font-weight: 600;
      }
      .pill.small {
        font-size: 11px;
        padding: 2px 8px;
      }
      .dev-node-detail,
      .dev-node-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        margin-top: 4px;
      }
      .dev-kind-head {
        margin: 14px 0 6px;
        font-size: 0.95rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .dev-sources {
        margin: 0;
        padding-left: 1.2rem;
      }
      .banner.warn {
        background: color-mix(in srgb, var(--warning-color) 18%, transparent);
        border: 1px solid var(--warning-color);
        border-radius: 8px;
        padding: 10px 12px;
      }
      .sov-health-ok {
        color: var(--success-color, #2e7d32);
        font-weight: 600;
      }
    </style>
  `;
}
