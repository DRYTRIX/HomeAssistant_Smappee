import { html, type TemplateResult } from "lit";
import { explanationForConnector } from "../logic/chargingExplanation.js";
import { logClientEvent } from "../observability.js";
import { selectChargerLoadBalance } from "../state/selectors.js";
import type { HomeAssistant } from "../types/hass.js";
import type { PanelPayload, PanelSessionEnriched } from "../types/panel.js";
import type { WidgetStatus } from "../state/selectors.js";
import { renderChargingExplanationBlock } from "./charging-explanation-ui.js";
import {
  renderNoDataReceivedState,
  renderWidgetSkeleton,
  renderWidgetStatus,
} from "./state-ui.js";

const DOMAIN = "ha_smappee_overview";

export function renderChargersTab(
  p: PanelPayload,
  hass: HomeAssistant,
  entryId: string,
  afterAction: () => void,
  widgetStatus: WidgetStatus,
  loading = false
): TemplateResult {
  const active = [...p.sessions_active, ...(p.sessions_enriched ?? [])].filter(
    (s, i, a) => a.findIndex((x) => x.id === s.id) === i
  );
  const activeCharging = active.filter((s) =>
    /charging|started/i.test(s.status || "")
  );

  const svc = async (
    name: string,
    data: Record<string, unknown>
  ): Promise<void> => {
    try {
      await hass.callService(DOMAIN, name, {
        config_entry_id: entryId,
        ...data,
      });
      afterAction();
    } catch (e) {
      logClientEvent("error", "ui.chargers.service_call", "charger service call failed", {
        service: name,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  if (!p.chargers?.length) {
    return html`${renderWidgetStatus(widgetStatus)} ${renderNoDataReceivedState()}`;
  }

  return html`
    ${renderWidgetStatus(widgetStatus)}
    ${loading ? renderWidgetSkeleton(2) : ""}
    <div class="charger-list">
      ${p.chargers.map((ch) => {
        const feat = p.charger_features?.[ch.serial];
        const lb = selectChargerLoadBalance(p, ch.serial);
        return html`
          <div class="card charger-card">
            ${renderWidgetStatus(widgetStatus)}
            <div class="charger-head">
              <h3>${ch.name}</h3>
              <span class="chip ${ch.availability ? "ok" : "off"}"
                >${ch.availability ? "Available" : "Unavailable"}</span
              >
            </div>
            <div class="muted mono">${ch.serial}</div>
            <div class="lb-row">
              Load balancing:
              ${lb.reported
                ? html`<code>${JSON.stringify(lb.value)}</code>`
                : html`<span class="muted">Not reported by API</span>`}
            </div>
            ${ch.connectors.map((co) => {
              const sess = activeCharging.find(
                (s) => s.charger_serial === ch.serial && s.connector === co.position
              );
              const expl = explanationForConnector(p, ch.serial, co.position);
              return html`
                <div class="connector-block">
                  <div class="conn-title conn-title-row">
                    <span>
                      Connector ${co.position} · mode
                      <strong>${co.mode}</strong>
                      · ${co.current_a ?? "—"} A
                      ${co.session_active ? html`<span class="live">Live</span>` : ""}
                    </span>
                  </div>
                  ${renderChargingExplanationBlock(expl)}
                  ${sess
                    ? html`
                        <div class="session-mini card-inner">
                          Session ${sess.id.slice(0, 8)}… ·
                          ${sess.energy_wh != null
                            ? `${(sess.energy_wh / 1000).toFixed(2)} kWh`
                            : "—"}
                        </div>
                      `
                    : ""}
                  <div class="btn-row">
                    <button
                      type="button"
                      class="btn"
                      @click=${() =>
                        svc("start_charging", {
                          charger_serial: ch.serial,
                          connector_position: co.position,
                        })}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${() =>
                        svc("pause_charging", {
                          charger_serial: ch.serial,
                          connector_position: co.position,
                        })}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${() =>
                        svc("stop_charging", {
                          charger_serial: ch.serial,
                          connector_position: co.position,
                        })}
                    >
                      Stop
                    </button>
                  </div>
                  ${feat?.supports_smart_mode
                    ? html`
                        <div class="mode-row">
                          <label>Mode</label>
                          <select
                            @change=${(ev: Event) => {
                              const sel = ev.target as HTMLSelectElement;
                              void svc("set_charging_mode", {
                                charger_serial: ch.serial,
                                connector_position: co.position,
                                mode: sel.value,
                              });
                            }}
                          >
                            <option value="standard">Standard</option>
                            <option value="smart">Smart</option>
                            <option value="solar">Solar</option>
                          </select>
                        </div>
                      `
                    : ""}
                  ${feat?.supports_current_limit
                    ? (() => {
                        const maxA = Math.min(32, feat.max_current_a ?? 32);
                        const minA = 6;
                        const curVal = Math.round(
                          Math.min(
                            maxA,
                            Math.max(minA, co.current_a ?? 16)
                          )
                        );
                        return html`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label">Current (A)</label>
                            <input
                              type="range"
                              min=${minA}
                              max=${maxA}
                              .value=${String(curVal)}
                              @change=${(ev: Event) => {
                                const inp = ev.target as HTMLInputElement;
                                const v = parseInt(inp.value, 10);
                                if (v >= minA)
                                  void svc("set_charging_current", {
                                    charger_serial: ch.serial,
                                    connector_position: co.position,
                                    current_a: v,
                                  });
                              }}
                            />
                            <span class="mono small">${curVal} A</span>
                          </div>
                        `;
                      })()
                    : ""}
                </div>
              `;
            })}
          </div>
        `;
      })}
    </div>
  `;
}
