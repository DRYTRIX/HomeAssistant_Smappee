import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fetchHistorySparklines,
  fetchPanelData,
  listEntries,
} from "./api/ws.js";
import { createSmappeeStore } from "./state/store.js";
import { selectStaleBanner } from "./state/selectors.js";
import type { HomeAssistant } from "./types/hass.js";
import type { PanelProps } from "./types/hass.js";
import type { PanelPayload, TabId } from "./types/panel.js";
import { renderChargersTab } from "./ui/chargers.js";
import { renderDevicesTab } from "./ui/devices-tab.js";
import { renderAdvancedPanel } from "./ui/advanced-panel.js";
import { renderDiagnosticsTab } from "./ui/diagnostics.js";
import { renderEconomicsTab } from "./ui/economics.js";
import { renderOverviewTab } from "./ui/overview/overview-tab.js";
import { overviewSectionStyles } from "./ui/overview/styles.js";
import { renderPageSkeleton } from "./ui/skeleton.js";
import { renderSessionsTab } from "./ui/sessions.js";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "chargers", label: "Chargers" },
  { id: "sessions", label: "Sessions" },
  { id: "economics", label: "Economics" },
  { id: "diagnostics", label: "Diagnostics" },
];

@customElement("ha-smappee-overview-panel")
export class HaSmappeeOverviewPanel extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: Boolean }) narrow = false;

  @property({ type: Object }) panel?: PanelProps;

  @state() private _tick = 0;

  private _store = createSmappeeStore("");

  private _unsub?: () => void;

  private _socketOpenHandler = (): void => {
    void this._loadPanel(false);
  };

  static styles = [
    css`
    :host {
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
      padding: 12px 16px 24px;
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
      border-radius: 8px;
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
      border-radius: 12px;
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
    if (withSkeleton) {
      this._store.setState({ connection: "loading", panelError: null });
    }
    try {
      const panel = await fetchPanelData(
        this.hass,
        selectedEntryId,
        this._store.getState().advancedMode
      );
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
    }
  }

  private async _loadHistory(panel: PanelPayload): Promise<void> {
    if (!this.hass?.callWS) return;
    const em = panel.entity_map;
    if (!em) return;
    const ids = Object.values(em).filter((x): x is string => Boolean(x));
    if (!ids.length) return;
    this._store.setState({ historyLoading: true });
    try {
      const hist = await fetchHistorySparklines(this.hass, ids);
      this._store.setState({ historyByEntity: hist, historyLoading: false });
    } catch {
      this._store.setState({ historyLoading: false });
    }
  }

  private async _onRefresh(): Promise<void> {
    const id = this._store.getState().selectedEntryId;
    if (!this.hass || !id) return;
    try {
      await this.hass.callService("ha_smappee_overview", "refresh", {
        config_entry_id: id,
      });
    } catch {
      /* still fetch */
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
          });
        case "devices":
          return renderDevicesTab(panel);
        case "chargers":
          return renderChargersTab(panel, hass, id, () => void this._loadPanel(false));
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
            }
          );
        case "economics":
          return renderEconomicsTab(
            panel,
            st.economicsPeriod,
            (per) => this._store.setState({ economicsPeriod: per })
          );
        case "diagnostics":
          return renderDiagnosticsTab(panel);
        default:
          return html``;
      }
    } catch (e) {
      console.error(e);
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
          </div>
        </header>
        ${st.panelError && st.connection === "error"
          ? html`
              <div class="banner err">
                ${st.panelError}
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
        ${st.connection === "loading" && !panel
          ? renderPageSkeleton()
          : panel
            ? html`${this._renderTab(panel)}
                ${st.advancedMode ? renderAdvancedPanel(panel) : nothing}`
            : html`<p class="muted">No data</p>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-smappee-overview-panel": HaSmappeeOverviewPanel;
  }
}
