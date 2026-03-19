import type { PanelChargingExplanation, PanelPayload } from "../types/panel.js";

export function explanationForConnector(
  p: PanelPayload,
  serial: string,
  pos: number
): PanelChargingExplanation | undefined {
  const rows = p.overview_context?.connector_explanations;
  return rows?.find((r) => r.charger_serial === serial && r.connector === pos)
    ?.explanation;
}
