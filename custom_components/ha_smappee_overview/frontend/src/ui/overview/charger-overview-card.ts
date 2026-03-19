import { html, type TemplateResult } from "lit";
import { chargingReasonFromHint } from "../../logic/overviewDerived.js";
import type { HomeAssistant } from "../../types/hass.js";
import type { PanelPayload } from "../../types/panel.js";

const DOMAIN = "ha_smappee_overview";

type Hint = NonNullable<
  PanelPayload["overview_context"]
>["active_ev_hints"][number];

function hintFor(
  hints: Hint[] | undefined,
  serial: string,
  pos: number
): Hint | undefined {
  return hints?.find((h) => h.charger_serial === serial && h.connector === pos);
}

function sourceLabel(s: string): string {
  if (s === "live") return "Live";
  if (s === "config") return "Config";
  return "Est.";
}

export function renderChargerOverviewCards(
  p: PanelPayload,
  hass: HomeAssistant,
  entryId: string,
  afterAction: () => void,
  onFullControls: () => void
): TemplateResult {
  const hints = p.overview_context?.active_ev_hints ?? [];

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
    return html`
      <div class="card sov-charger-section">
        <h2 class="sov-h2">EV chargers</h2>
        <p class="muted">No chargers discovered for this installation.</p>
      </div>
    `;
  }

  return html`
    <div class="sov-charger-section">
      <div class="sov-charger-head">
        <h2 class="sov-h2">Charger control</h2>
        <button
          type="button"
          class="btn secondary sov-link-chargers"
          @click=${onFullControls}
        >
          Full controls →
        </button>
      </div>
      <div class="sov-charger-grid">
        ${p.chargers.map((ch) => {
          const feat = p.charger_features?.[ch.serial];
          const anySess = ch.connectors.some((c) => c.session_active);
          const estW = p.overview_context?.estimated_ev_power_w;
          return html`
            <div class="card sov-charger-card">
              <div class="sov-charger-title-row">
                <strong>${ch.name}</strong>
                <span class="chip ${ch.availability ? "ok" : "off"}"
                  >${ch.availability ? "Available" : "Unavailable"}</span
                >
              </div>
              <div class="muted mono small">${ch.serial}</div>
              ${anySess && estW != null && estW > 0
                ? html`<p class="muted small">
                    Site EV power (est.): ~${Math.round(estW)} W
                  </p>`
                : ""}
              ${ch.connectors.map((co) => {
                const h = hintFor(hints, ch.serial, co.position);
                const reason = h ? chargingReasonFromHint(h) : null;
                const maxA = Math.min(32, feat?.max_current_a ?? 32);
                const minA = 6;
                const curVal = Math.round(
                  Math.min(maxA, Math.max(minA, co.current_a ?? 16))
                );
                return html`
                  <div class="sov-connector-quick">
                    <div class="sov-conn-line">
                      <span>Connector ${co.position}</span>
                      <span class="mono"
                        >${co.mode} · ${co.current_a ?? "—"} A</span
                      >
                      ${co.session_active
                        ? html`<span class="live">Session</span>`
                        : ""}
                    </div>
                    ${reason
                      ? html`
                          <div
                            class="sov-charge-reason"
                            title=${reason.detail}
                          >
                            <span class="sov-charge-reason-label"
                              >${reason.short}</span
                            >
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
                    ${feat?.supports_current_limit
                      ? html`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label"
                              >Current limit (A)</label
                            >
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
                        `
                      : ""}
                    ${h && h.pause_explanation.code !== "charging"
                      ? html`
                          <div class="sov-pause-box card-inner">
                            <div class="sov-pause-title">Status</div>
                            <p>
                              <strong>${h.pause_explanation.title}</strong>
                            </p>
                            <p class="muted small">
                              ${h.pause_explanation.detail}
                            </p>
                          </div>
                        `
                      : ""}
                    ${h?.limit_chain.length
                      ? html`
                          <div class="sov-limit-chain">
                            <div class="sov-limit-chain-h">
                              What limits charge speed
                            </div>
                            <ol class="sov-limit-list">
                              ${h.limit_chain.map(
                                (step) => html`
                                  <li>
                                    <span class="sov-limit-label"
                                      >${step.label}</span
                                    >
                                    <span class="mono">${step.value}</span>
                                    <span
                                      class="sov-src sov-src--${step.source}"
                                      >${sourceLabel(step.source)}</span
                                    >
                                  </li>
                                `
                              )}
                            </ol>
                          </div>
                        `
                      : ""}
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
                  </div>
                `;
              })}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
