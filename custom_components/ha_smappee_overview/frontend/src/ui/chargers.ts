import { html, type TemplateResult } from "lit";
import { selectChargerLoadBalance } from "../state/selectors.js";
import type { HomeAssistant } from "../types/hass.js";
import type { PanelPayload, PanelSessionEnriched } from "../types/panel.js";

const DOMAIN = "ha_smappee_overview";

export function renderChargersTab(
  p: PanelPayload,
  hass: HomeAssistant,
  entryId: string,
  afterAction: () => void
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
      console.error(e);
    }
  };

  if (!p.chargers?.length) {
    return html`<p class="muted">No chargers discovered.</p>`;
  }

  return html`
    <div class="charger-list">
      ${p.chargers.map((ch) => {
        const feat = p.charger_features?.[ch.serial];
        const lb = selectChargerLoadBalance(p, ch.serial);
        return html`
          <div class="card charger-card">
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
              return html`
                <div class="connector-block">
                  <div class="conn-title">
                    Connector ${co.position} · mode
                    <strong>${co.mode}</strong>
                    · ${co.current_a ?? "—"} A
                    ${co.session_active ? html`<span class="live">Live</span>` : ""}
                  </div>
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
                    ? html`
                        <div class="mode-row">
                          <label>Current (A)</label>
                          <input
                            type="number"
                            min="6"
                            max=${feat.max_current_a ?? 32}
                            .value=${String(co.current_a ?? 16)}
                            @change=${(ev: Event) => {
                              const inp = ev.target as HTMLInputElement;
                              const v = parseInt(inp.value, 10);
                              if (v >= 6)
                                void svc("set_charging_current", {
                                  charger_serial: ch.serial,
                                  connector_position: co.position,
                                  current_a: v,
                                });
                            }}
                          />
                        </div>
                      `
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
