import { css } from "lit";

/** Overview tab — namespaced .sov-* */
export const overviewSectionStyles = css`
  .sov-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .sov-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  .sov-h2 {
    margin: 0 0 10px;
    font-size: 1.05rem;
    font-weight: 600;
  }
  .sov-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .sov-health-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    border: 1px solid var(--divider-color);
    position: sticky;
    top: 0;
    z-index: 3;
    backdrop-filter: blur(6px);
  }
  .sov-health-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
  .sov-health-label {
    color: var(--secondary-text-color);
    font-size: 12px;
  }
  .sov-health-warn {
    color: var(--warning-color, #b35900);
  }
  .sov-shimmer {
    animation: sov-pulse 1.2s ease-in-out infinite;
  }
  @keyframes sov-pulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }
  .sov-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .sov-badge--live {
    background: color-mix(in srgb, var(--success-color, #2e7d32) 22%, transparent);
    color: var(--success-color, #1b5e20);
  }
  .sov-badge--calculated {
    background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    color: var(--primary-color);
  }
  .sov-badge--config {
    background: color-mix(in srgb, var(--secondary-text-color) 15%, transparent);
    color: var(--secondary-text-color);
  }
  .sov-scan {
    margin-bottom: 4px;
  }
  .sov-anomalies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .sov-anomalies--ok {
    padding: 4px 0;
  }
  .sov-anomaly {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sov-anomaly--ok {
    background: color-mix(in srgb, var(--success-color, #2e7d32) 15%, transparent);
    color: var(--success-color, #1b5e20);
  }
  .sov-anomaly--error {
    background: color-mix(in srgb, var(--error-color) 22%, transparent);
    color: var(--error-color);
  }
  .sov-anomaly--warn {
    background: color-mix(in srgb, var(--warning-color) 25%, transparent);
    color: var(--primary-text-color);
  }
  .sov-anomaly--info {
    background: var(--disabled-color);
    color: var(--primary-text-color);
  }
  .sov-flow-kpi-wrap {
    display: grid;
    grid-template-columns: minmax(260px, 0.9fr) minmax(300px, 1.4fr);
    gap: 12px;
    align-items: start;
  }
  .sov-root--narrow .sov-flow-kpi-wrap {
    grid-template-columns: 1fr;
  }
  .sov-flow-schematic {
    margin-bottom: 0;
  }
  .sov-flow-card--empty {
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sov-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .sov-root--narrow .sov-kpi-grid {
    grid-template-columns: 1fr;
  }
  .sov-kpi .kpi-v {
    font-size: 1.2rem;
  }
  .sov-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-wrap: wrap;
  }
  .sov-spark-skel {
    height: 36px;
    width: 100%;
    max-width: 140px;
    border-radius: 6px;
  }
  .sov-insights {
    margin-top: 4px;
  }
  .sov-insight-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .sov-root--narrow .sov-insight-grid {
    grid-template-columns: 1fr;
  }
  .sov-insight {
    margin-bottom: 0;
    transition: opacity 0.18s ease;
  }
  .sov-insight-title {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 14px;
  }
  .sov-insight-body {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
  }
  .sov-insight--warn {
    border-left: 3px solid var(--warning-color);
  }
  .sov-insight--info {
    border-left: 3px solid var(--primary-color);
  }
  .sov-econ-hero {
    margin-bottom: 0;
  }
  .sov-econ-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  .sov-econ-primary {
    grid-column: span 2;
  }
  .sov-root--narrow .sov-econ-primary {
    grid-column: span 1;
  }
  .sov-econ-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .sov-econ-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .sov-econ-big {
    font-size: 1.75rem;
    line-height: 1.2;
  }
  .sov-econ-big strong {
    font-weight: 700;
  }
  .sov-econ-sub {
    display: block;
    font-size: 13px;
    margin-top: 6px;
  }
  .sov-footnote {
    margin: 10px 0 0;
  }
  .sov-charger-section {
    margin-top: 4px;
  }
  .sov-charger-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .sov-charger-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }
  .sov-charger-card {
    margin-bottom: 0;
  }
  .sov-charger-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
  .sov-connector-quick {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--divider-color);
  }
  .sov-conn-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .sov-pause-box {
    margin: 10px 0;
    padding: 10px 12px;
  }
  .sov-pause-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .sov-limit-chain {
    margin-top: 10px;
    padding: 10px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
  }
  .sov-limit-chain-h {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .sov-limit-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
  }
  .sov-limit-list li {
    margin-bottom: 6px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    align-items: baseline;
  }
  .sov-root--narrow .sov-limit-list li {
    grid-template-columns: 1fr;
  }
  .sov-limit-label {
    color: var(--secondary-text-color);
  }
  .sov-src {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .sov-src--live {
    background: color-mix(in srgb, var(--success-color) 18%, transparent);
  }
  .sov-src--config {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
  }
  .sov-src--estimated {
    background: color-mix(in srgb, var(--warning-color) 20%, transparent);
  }
  .sov-empty {
    padding: 32px 20px;
    text-align: center;
    border-radius: 12px;
    border: 1px dashed var(--divider-color);
  }
  .sov-empty-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  .sov-empty-body {
    margin: 0 0 16px;
  }
`;
