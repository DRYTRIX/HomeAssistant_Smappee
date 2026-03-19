import { html, type TemplateResult } from "lit";
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

export function renderChargerQuick(
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
        <h2 class="sov-h2">EV quick controls</h2>
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
          return html`
            <div class="card sov-charger-card">
              <div class="sov-charger-title-row">
                <strong>${ch.name}</strong>
                <span class="chip ${ch.availability ? "ok" : "off"}"
                  >${ch.availability ? "Available" : "Unavailable"}</span
                >
              </div>
              <div class="muted mono small">${ch.serial}</div>
              ${ch.connectors.map((co) => {
                const h = hintFor(hints, ch.serial, co.position);
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
                    </div>
                    ${h
                      ? html`
                          ${h.pause_explanation.code !== "charging"
                            ? html`
                                <div class="sov-pause-box card-inner">
                                  <div class="sov-pause-title">
                                    Why charging is not active
                                  </div>
                                  <p>
                                    <strong>${h.pause_explanation.title}</strong>
                                  </p>
                                  <p class="muted small">
                                    ${h.pause_explanation.detail}
                                  </p>
                                </div>
                              `
                            : ""}
                          ${h.limit_chain.length
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
                        `
                      : co.session_active
                        ? html`
                            <p class="muted small">
                              Live session—open Full controls for mode and
                              current.
                            </p>
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
