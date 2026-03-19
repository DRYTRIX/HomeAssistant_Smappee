import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fetchHistorySparklines,
  fetchPanelData,
  listEntries,
} from "./api/ws.js";
import { createSmappeeStore } from "./state/store.js";
import {
  deriveWidgetStatus,
  selectDashboardUiState,
  selectStaleBanner,
} from "./state/selectors.js";
import type { HomeAssistant } from "./types/hass.js";
import type { PanelProps } from "./types/hass.js";
import type { PanelPayload, TabId } from "./types/panel.js";
import { renderChargersTab } from "./ui/chargers.js";
import { renderDevicesTab } from "./ui/devices-tab.js";
import { renderAdvancedPanel } from "./ui/advanced-panel.js";
import { renderDiagnosticsTab } from "./ui/diagnostics.js";
import { renderEconomicsTab } from "./ui/economics.js";
import { renderHealthTab } from "./ui/health.js";
import { renderOverviewTab } from "./ui/overview/overview-tab.js";
import { overviewSectionStyles } from "./ui/overview/styles.js";
import { renderPageSkeleton } from "./ui/skeleton.js";
import { renderSessionsTab } from "./ui/sessions.js";
import {
  renderNoDataReceivedState,
  renderStateError,
  renderWidgetStatus,
} from "./ui/state-ui.js";
import { logClientEvent } from "./observability.js";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "devices", label: "Devices" },
  { id: "chargers", label: "Chargers" },
  { id: "sessions", label: "Sessions" },
  { id: "economics", label: "Economics" },
  { id: "health", label: "Health" },
  { id: "diagnostics", label: "Diagnostics" },
];
const TIME_PRESETS: Array<{ id: "live" | "5m" | "1h" | "24h"; label: string }> = [
  { id: "live", label: "Live" },
  { id: "5m", label: "5m" },
  { id: "1h", label: "1h" },
  { id: "24h", label: "24h" },
];

@customElement("ha-smappee-overview-panel")
export class HaSmappeeOverviewPanel extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: Boolean }) narrow = false;

  @property({ type: Object }) panel?: PanelProps;

  @state() private _tick = 0;

  private _store = createSmappeeStore("");

  private _unsub?: () => void;
  private _inflightPanel?: Promise<void>;
  private _inflightHistory?: Promise<void>;
  private _historyKey = "";
  private _lastPanelLoadAt = 0;

  private _socketOpenHandler = (): void => {
    void this._loadPanel(false);
  };

  static styles = [
    css`
    :host {
      --smappee-space-sm: 10px;
      --smappee-space-md: 14px;
      --smappee-radius: 10px;
      --smappee-card-radius: 12px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      box-sizing: border-box;
      padding: 0;
      background: var(--lovelace-background, var(--primary-background-color));
      color: var(--primary-text-color);
      font-family: var(
        --ha-font-family-body,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        sans-serif
      );
      font-size: 14px;
      line-height: 1.45;
    }
    .wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: var(--smappee-space-sm) var(--smappee-space-md) 24px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
    }
    .status-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .status-item {
      border: 1px solid var(--divider-color);
      border-radius: var(--smappee-radius);
      padding: 8px 10px;
      background: var(--card-background-color);
    }
    .status-item strong {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .time-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      align-items: center;
    }
    .time-preset-btn {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      padding: 6px 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }
    .time-preset-btn.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      font-weight: 600;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }
    .header h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 600;
      flex: 1 1 200px;
    }
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .pill {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--disabled-color);
    }
    .pill.ok {
      background: color-mix(in srgb, var(--success-color, #418041) 25%, transparent);
      color: var(--success-color, #2e7d32);
    }
    .pill.err {
      background: color-mix(in srgb, var(--error-color) 20%, transparent);
      color: var(--error-color);
    }
    .pill.load {
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
    }
    select,
    input[type="number"],
    input[type="search"],
    input[type="date"] {
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--smappee-radius);
      padding: 8px 10px;
      font-size: 14px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      font-size: 14px;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn.secondary {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color);
    }
    .badge-alerts {
      background: var(--warning-color);
      color: #000;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .small {
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      margin-right: 4px;
      vertical-align: middle;
    }
    .mono.small {
      font-size: 11px;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 16px;
    }
    .tabs button {
      padding: 10px 16px;
      border: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .tabs button.active {
      background: var(--card-background-color);
      color: var(--primary-color);
      font-weight: 600;
    }
    .banner {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: color-mix(in srgb, var(--warning-color) 22%, transparent);
      color: var(--primary-text-color);
    }
    .banner.err {
      background: color-mix(in srgb, var(--error-color) 18%, transparent);
    }
    .tab-error {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: var(--smappee-card-radius);
    }
    .card {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(
        --ha-card-box-shadow,
        0 1px 3px rgba(0, 0, 0, 0.08)
      );
    }
    .card-h {
      margin: 0 0 8px;
      font-size: 1rem;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .mono {
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
    .flow-row {
      margin-bottom: 12px;
    }
    .flow-schematic .flow-title {
      font-weight: 600;
      margin-bottom: 12px;
    }
    .flow-nodes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }
    .flow-node {
      padding: 10px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .flow-label {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .kpi .kpi-h {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 0 0 4px;
    }
    .kpi .kpi-v {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .spark-svg {
      display: block;
    }
    .spark-empty {
      font-size: 11px;
      color: var(--secondary-text-color);
      min-height: 36px;
      line-height: 36px;
    }
    .row-2 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .charger-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .charger-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .charger-head h3 {
      margin: 0;
    }
    .chip {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .chip.ok {
      background: color-mix(in srgb, var(--success-color, #418041) 20%, transparent);
    }
    .chip.off {
      background: var(--disabled-color);
    }
    .lb-row {
      margin: 8px 0;
      font-size: 13px;
    }
    .connector-block {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
    }
    .conn-title {
      margin-bottom: 8px;
    }
    .conn-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .exp-expl-wrap {
      margin: 8px 0;
    }
    .exp-badge {
      cursor: help;
      font-weight: 500;
    }
    .exp-badge--warn {
      background: color-mix(
        in srgb,
        var(--warning-color, #b85c00) 22%,
        transparent
      );
    }
    .exp-badge--info {
      background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    }
    .exp-badge--neutral {
      background: var(--disabled-color);
    }
    .exp-details {
      margin-top: 6px;
    }
    .exp-details summary {
      cursor: pointer;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .exp-expl-msg {
      margin: 8px 0 0;
    }
    .exp-suggest-h,
    .exp-chain-h {
      font-size: 12px;
      font-weight: 600;
      margin: 10px 0 4px;
      color: var(--secondary-text-color);
    }
    .exp-suggest {
      margin: 0 0 8px;
      padding-left: 20px;
      font-size: 13px;
    }
    .exp-chain-list {
      margin: 0 0 8px;
      padding-left: 20px;
      font-size: 13px;
    }
    .exp-chain-li {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .exp-chain-label {
      color: var(--primary-text-color);
    }
    .exp-chain-src {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .exp-json {
      margin-top: 8px;
    }
    .live {
      color: var(--success-color, #2e7d32);
      font-weight: 600;
      margin-left: 8px;
    }
    .session-mini {
      margin-bottom: 8px;
      padding: 8px;
      font-size: 13px;
    }
    .card-inner {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      border-radius: 8px;
    }
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .mode-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .sessions-toolbar {
      margin-bottom: 12px;
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
      align-items: flex-end;
    }
    .toolbar-row label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .data-table th,
    .data-table td {
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid var(--divider-color);
    }
    .data-table th {
      cursor: pointer;
      user-select: none;
      color: var(--secondary-text-color);
      font-weight: 600;
    }
    .table-wrap {
      overflow-x: auto;
    }
    .advanced-region {
      margin-top: 20px;
      border-left: 3px solid var(--warning-color);
      padding-left: 12px;
    }
    .adv-details {
      margin-top: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-details summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .adv-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .adv-table td {
      padding: 4px 8px 4px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-hint {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      user-select: none;
    }
    .adv-toggle input {
      margin: 0;
    }
    .json-pre {
      overflow: auto;
      max-height: 280px;
      font-size: 11px;
      margin: 0;
    }
    .be-badge.ok {
      border-left: 4px solid var(--success-color, #2e7d32);
    }
    .be-badge.warn {
      border-left: 4px solid var(--warning-color);
    }
    .ok-text {
      color: var(--success-color, #2e7d32);
    }
    .warn-text {
      color: var(--error-color);
    }
    .tariff-list {
      margin: 0;
      padding-left: 20px;
    }
    .ei-title {
      margin-bottom: 4px;
    }
    .ei-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .ei-split-bar {
      display: flex;
      height: 24px;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 8px;
      border: 1px solid var(--divider-color);
    }
    .ei-split-solar {
      height: 100%;
      background: color-mix(
        in srgb,
        var(--success-color, #2e7d32) 55%,
        transparent
      );
    }
    .ei-split-grid {
      height: 100%;
      background: color-mix(
        in srgb,
        var(--primary-color) 35%,
        var(--disabled-color)
      );
    }
    .ei-split-legend {
      margin-top: 8px;
    }
    .ei-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }
    .ei-dot.solar {
      background: var(--success-color, #2e7d32);
    }
    .ei-dot.grid {
      background: var(--primary-color);
    }
    .badge.warn {
      background: color-mix(
        in srgb,
        var(--warning-color) 45%,
        var(--disabled-color)
      );
      color: var(--primary-text-color);
    }
    .ei-svg {
      display: block;
      max-width: 100%;
      height: auto;
      margin-top: 8px;
    }
    .ei-assumptions summary {
      list-style: none;
    }
    .ei-assumptions summary::-webkit-details-marker {
      display: none;
    }
    .skel-layout {
      padding: 8px 0;
    }
    .skel {
      background: linear-gradient(
        90deg,
        var(--divider-color) 25%,
        var(--secondary-background-color) 50%,
        var(--divider-color) 75%
      );
      background-size: 200% 100%;
      animation: skel 1.2s ease-in-out infinite;
      border-radius: 8px;
    }
    @keyframes skel {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    .skel-line {
      height: 16px;
      margin-bottom: 12px;
    }
    .skel-title {
      height: 28px;
      width: 40%;
      margin-bottom: 20px;
    }
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }
    .skel-card {
      height: 120px;
    }
    .sess-toggle {
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
    }
    .sess-row {
      cursor: pointer;
    }
    .sess-row:hover {
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
    }
    .sess-group-head td {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      font-weight: 600;
      font-size: 13px;
    }
    .sess-detail {
      padding: 12px;
      text-align: left;
    }
    .sess-detail-row td {
      padding-top: 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .econ-period-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .econ-period-tabs button {
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
    }
    .econ-period-tabs button.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      font-weight: 600;
    }
    .econ-hero-line {
      font-size: 1.15rem;
      margin: 12px 0;
    }
    .state-card {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      background: var(--card-background-color);
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .state-card h3 {
      margin: 0 0 8px;
    }
    .state-card-error {
      border-left: 4px solid var(--error-color);
    }
    .state-card-empty {
      border-left: 4px solid var(--primary-color);
    }
    .state-cause-list {
      margin: 4px 0 0;
      padding-left: 18px;
    }
    .widget-status-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    .fresh-pill {
      border-radius: 999px;
      padding: 2px 8px;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .fresh-live {
      background: color-mix(in srgb, var(--success-color, #2e7d32) 20%, transparent);
      color: var(--success-color, #2e7d32);
    }
    .fresh-stale {
      background: color-mix(in srgb, var(--warning-color) 24%, transparent);
    }
    .fresh-offline {
      background: color-mix(in srgb, var(--error-color) 20%, transparent);
      color: var(--error-color);
    }
    .widget-skel {
      margin: 10px 0;
    }
    @media (max-width: 920px) {
      .wrap {
        padding: var(--smappee-space-sm);
      }
      .header-actions {
        width: 100%;
      }
      .tabs button {
        flex: 1 1 auto;
      }
    }
  `,
    overviewSectionStyles,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    const def = this.panel?.config?.config_entry_id ?? "";
    this._store = createSmappeeStore(def);
    if (def && !this._store.getState().selectedEntryId) {
      this._store.setState({ selectedEntryId: def });
    }
    this._unsub = this._store.subscribe(() => {
      this._tick++;
      this.requestUpdate();
    });
    const sk = this.hass?.connection.socket;
    sk?.addEventListener?.("open", this._socketOpenHandler);
    void this._bootstrap();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    const sk = this.hass?.connection.socket;
    sk?.removeEventListener?.("open", this._socketOpenHandler);
  }

  updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has("hass") && this.hass) {
      void this._bootstrap();
    }
  }

  private get _entryId(): string {
    return this.panel?.config?.config_entry_id ?? "";
  }

  private async _bootstrap(): Promise<void> {
    if (!this.hass || !this._entryId) return;
    try {
      const entries = await listEntries(this.hass);
      const st = this._store.getState();
      let sel = st.selectedEntryId;
      if (!entries.some((e) => e.entry_id === sel)) {
        sel = entries[0]?.entry_id ?? this._entryId;
      }
      this._store.setState({
        entries: entries.map((e) => ({
          entry_id: e.entry_id,
          title: e.title,
        })),
        selectedEntryId: sel,
      });
      this._store.persistEntry(sel);
      await this._loadPanel(true);
    } catch (e) {
      this._store.setState({
        entries: [
          {
            entry_id: this._entryId,
            title: this.panel?.config?.title ?? "Smappee",
          },
        ],
        selectedEntryId:
          this._store.getState().selectedEntryId || this._entryId,
      });
      await this._loadPanel(true);
      this._store.setState({
        panelError:
          e instanceof Error
            ? `Installations list failed: ${e.message}`
            : String(e),
      });
    }
  }

  private async _loadPanel(withSkeleton: boolean): Promise<void> {
    if (!this.hass) return;
    const { selectedEntryId } = this._store.getState();
    if (!selectedEntryId) return;
    const now = Date.now();
    if (!withSkeleton && this._inflightPanel) return this._inflightPanel;
    if (!withSkeleton && now - this._lastPanelLoadAt < 1500) return;
    if (withSkeleton) this._store.setState({ connection: "loading", panelError: null });
    this._inflightPanel = (async () => {
      try {
        const panel = await fetchPanelData(
          this.hass!,
          selectedEntryId,
          this._store.getState().advancedMode || this._store.getState().debugMode,
          this._store.getState().debugMode
        );
        this._lastPanelLoadAt = Date.now();
        this._store.setState({
          panel,
          connection: "connected",
          panelError: null,
          lastFetchAt: Date.now(),
          tabError: null,
        });
        void this._loadHistory(panel);
      } catch (e) {
        this._store.setState({
          connection: "error",
          panelError: e instanceof Error ? e.message : String(e),
        });
      } finally {
        this._inflightPanel = undefined;
      }
    })();
    return this._inflightPanel;
  }

  private async _loadHistory(panel: PanelPayload): Promise<void> {
    if (!this.hass?.callWS) return;
    const em = panel.entity_map;
    if (!em) return;
    const ids = Object.values(em).filter((x): x is string => Boolean(x));
    if (!ids.length) return;
    const preset = this._store.getState().timePreset;
    const windowMinutes =
      preset === "5m" ? 5 : preset === "1h" ? 60 : preset === "24h" ? 24 * 60 : 5;
    const key = `${ids.slice().sort().join(",")}::${windowMinutes}`;
    if (this._inflightHistory && key === this._historyKey) return this._inflightHistory;
    this._historyKey = key;
    this._store.setState({ historyLoading: true });
    this._inflightHistory = (async () => {
      try {
        const hist = await fetchHistorySparklines(this.hass!, ids, 48, windowMinutes);
        this._store.setState({ historyByEntity: hist, historyLoading: false });
      } catch {
        logClientEvent("warning", "panel.load_history", "history load failed");
        this._store.setState({ historyLoading: false });
      } finally {
        this._inflightHistory = undefined;
      }
    })();
    return this._inflightHistory;
  }

  private async _onRefresh(): Promise<void> {
    const id = this._store.getState().selectedEntryId;
    if (!this.hass || !id) return;
    try {
      await this.hass.callService("ha_smappee_overview", "refresh", {
        config_entry_id: id,
      });
    } catch (err) {
      this._store.setState({
        panelError:
          err instanceof Error
            ? `Refresh service failed: ${err.message}`
            : "Refresh service failed",
      });
      logClientEvent("warning", "panel.refresh", "refresh service call failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await this._loadPanel(false);
  }

  private _renderTab(panel: PanelPayload) {
    const st = this._store.getState();
    const id = st.selectedEntryId;
    const hass = this.hass!;
    try {
      switch (st.activeTab) {
        case "overview":
          return renderOverviewTab(panel, st.historyByEntity, panel.entity_map, {
            connection: st.connection,
            historyLoading: st.historyLoading,
            narrow: this.narrow,
            hass,
            entryId: id,
            afterAction: () => void this._loadPanel(false),
            onOpenChargersTab: () =>
              this._store.setState({ activeTab: "chargers" }),
            onOpenDiagnostics: () =>
              this._store.setState({ activeTab: "diagnostics" }),
            widgetStatus: deriveWidgetStatus(panel, "device"),
            loading: st.connection === "loading",
            layoutTemplate: st.overviewTemplate,
            layoutOrder: st.overviewOrder,
            onTemplateChange: (template) =>
              this._store.persistOverviewLayout(template, st.overviewOrder),
            onLayoutReorder: (order) =>
              this._store.persistOverviewLayout(st.overviewTemplate, order),
          });
        case "devices":
          return renderDevicesTab(
            panel,
            deriveWidgetStatus(panel, "protocol"),
            st.connection === "loading"
          );
        case "chargers":
          return renderChargersTab(
            panel,
            hass,
            id,
            () => void this._loadPanel(false),
            deriveWidgetStatus(panel, "device"),
            st.connection === "loading"
          );
        case "sessions":
          return renderSessionsTab(
            panel,
            st.sessionsFilters,
            st.sessionsSort,
            {
              groupByDay: st.sessionsGroupByDay,
              expandedRowId: st.sessionsExpandedRowId,
              onToggleGroupByDay: (v) =>
                this._store.setState({ sessionsGroupByDay: v }),
              onToggleExpand: (rowId) =>
                this._store.setState({ sessionsExpandedRowId: rowId }),
            },
            (f) =>
              this._store.setState({
                sessionsFilters: { ...st.sessionsFilters, ...f },
              }),
            (col) => {
              const same = st.sessionsSort.column === col;
              this._store.setState({
                sessionsSort: {
                  column: col,
                  dir: same && st.sessionsSort.dir === "desc" ? "asc" : "desc",
                },
              });
            },
            () => {
              /* export placeholder */
            },
            deriveWidgetStatus(panel, "protocol"),
            st.timePreset,
            st.connection === "loading"
          );
        case "economics":
          return renderEconomicsTab(
            panel,
            st.economicsPeriod,
            (per) => this._store.setState({ economicsPeriod: per }),
            deriveWidgetStatus(panel, "protocol"),
            st.connection === "loading"
          );
        case "diagnostics":
          return renderDiagnosticsTab(
            panel,
            deriveWidgetStatus(panel, "protocol"),
            st.debugMode,
            st.connection === "loading"
          );
        case "health":
          return renderHealthTab(panel);
        default:
          return html``;
      }
    } catch (e) {
      logClientEvent("error", "panel.render_tab", "tab render failed", {
        error: e instanceof Error ? e.message : String(e),
      });
      return html`
        <div class="tab-error">
          <p class="banner err">Something went wrong in this tab.</p>
          <button type="button" class="btn" @click=${() => {
            this._store.setState({ tabError: null });
            void this._loadPanel(false);
          }}>
            Retry
          </button>
        </div>
      `;
    }
  }

  render() {
    const title = this.panel?.config?.title ?? "Smappee";
    const st = this._store.getState();
    void this._tick;

    if (!this._entryId) {
      return html`<div class="wrap">
        <div class="banner err">Missing panel configuration.</div>
      </div>`;
    }

    const panel = st.panel;
    const staleMsg = selectStaleBanner(panel);
    const alerts = panel?.alerts?.length ?? 0;
    const localAlerts = panel?.health?.alerts ?? [];
    const uiState = selectDashboardUiState(
      panel,
      st.connection,
      st.panelError,
      st.sessionsFilters
    );
    const connections = panel?.chargers?.length ?? 0;
    const ageS =
      panel?.last_successful_update != null
        ? Math.max(
            0,
            Math.round(
              (Date.now() - new Date(panel.last_successful_update).getTime()) / 1000
            )
          )
        : null;
    const dataRate = ageS == null ? "n/a" : ageS < 30 ? "high" : ageS < 120 ? "normal" : "low";

    return html`
      <div class="wrap">
        <header class="header">
          <h1>${title}</h1>
          <div class="header-actions">
            <select
              aria-label="Installation"
              .value=${st.selectedEntryId}
              @change=${(e: Event) => {
                const v = (e.target as HTMLSelectElement).value;
                this._store.persistEntry(v);
                this._store.setState({ selectedEntryId: v });
                void this._loadPanel(true);
              }}
            >
              ${st.entries.length
                ? st.entries.map(
                    (en) =>
                      html`<option value=${en.entry_id}>${en.title}</option>`
                  )
                : html`<option value=${st.selectedEntryId}>${title}</option>`}
            </select>
            <button type="button" class="btn secondary" @click=${() => void this._onRefresh()}>
              Refresh
            </button>
            <span
              class="pill ${st.connection === "connected"
                ? "ok"
                : st.connection === "loading"
                  ? "load"
                  : st.connection === "error"
                    ? "err"
                    : ""}"
            >
              ${st.connection === "connected"
                ? "Connected"
                : st.connection === "loading"
                  ? "Loading…"
                  : st.connection === "error"
                    ? "Error"
                    : "Idle"}
            </span>
            ${panel?.last_successful_update
              ? html`<span class="muted"
                  >Sync ${panel.last_successful_update.replace("T", " ").slice(0, 19)}Z</span
                >`
              : ""}
            ${alerts > 0
              ? html`<span class="badge-alerts" title="Alerts">${alerts}</span>`
              : ""}
            <label class="adv-toggle">
              <input
                type="checkbox"
                .checked=${st.advancedMode}
                @change=${(e: Event) => {
                  const on = (e.target as HTMLInputElement).checked;
                  this._store.persistAdvancedMode(on);
                  void this._loadPanel(true);
                }}
              />
              Advanced mode
            </label>
            <label class="adv-toggle">
              <input
                type="checkbox"
                .checked=${st.debugMode}
                @change=${(e: Event) => {
                  const on = (e.target as HTMLInputElement).checked;
                  this._store.persistDebugMode(on);
                  void this._loadPanel(false);
                }}
              />
              Debug mode
            </label>
          </div>
        </header>
        <div class="status-bar">
          <div class="status-item">
            <strong>System health</strong>
            ${panel?.meta?.coordinator_last_update_success === false ? "Degraded" : "Healthy"}
          </div>
          <div class="status-item">
            <strong>Active connections</strong>
            ${connections}
          </div>
          <div class="status-item">
            <strong>Data rate</strong>
            ${dataRate}
          </div>
        </div>
        <div class="time-presets" role="group" aria-label="Time controls">
          ${TIME_PRESETS.map(
            (tp) => html`<button
              type="button"
              class="time-preset-btn ${st.timePreset === tp.id ? "active" : ""}"
              @click=${() => {
                this._store.setState({ timePreset: tp.id });
                const current = this._store.getState().panel;
                if (current) void this._loadHistory(current);
              }}
            >
              ${tp.label}
            </button>`
          )}
          <span class="muted small">Active range: ${st.timePreset}</span>
        </div>
        ${st.panelError && st.connection === "error"
          ? html`
              <div class="banner err">
                Connection failed: ${st.panelError}
                <button
                  type="button"
                  class="btn secondary"
                  style="margin-left:12px"
                  @click=${() => void this._loadPanel(true)}
                >
                  Retry
                </button>
              </div>
            `
          : nothing}
        ${staleMsg
          ? html`<div class="banner">${staleMsg}</div>`
          : nothing}
        ${localAlerts.length
          ? html`<div class="banner">
              ${localAlerts.length} local observability alert(s) active.
            </div>`
          : nothing}
        <nav class="tabs" role="tablist">
          ${TABS.map(
            (t) => html`
              <button
                type="button"
                role="tab"
                class=${st.activeTab === t.id ? "active" : ""}
                aria-selected=${st.activeTab === t.id}
                @click=${() => this._store.setState({ activeTab: t.id })}
              >
                ${t.label}
              </button>
            `
          )}
        </nav>
        ${uiState === "loading" && !panel
          ? renderPageSkeleton()
          : uiState === "error_connection" ||
              uiState === "error_no_data_range" ||
              uiState === "error_parsing"
            ? renderStateError(uiState)
            : uiState === "empty_no_devices"
              ? renderNoDataReceivedState()
              : panel
                ? html`${renderWidgetStatus(deriveWidgetStatus(panel, "protocol"))}
                    ${this._renderTab(panel)}
                ${st.advancedMode || st.debugMode ? renderAdvancedPanel(panel) : nothing}`
                : renderNoDataReceivedState()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-smappee-overview-panel": HaSmappeeOverviewPanel;
  }
}
