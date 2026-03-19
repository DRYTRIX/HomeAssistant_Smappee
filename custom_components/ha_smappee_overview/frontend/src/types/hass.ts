import type { PanelConfig } from "./panel-config.js";

export interface HassConnection {
  sendMessagePromise(msg: Record<string, unknown>): Promise<unknown>;
  socket?: {
    addEventListener?: (ev: string, fn: () => void) => void;
    removeEventListener?: (ev: string, fn: () => void) => void;
  };
}

export interface HomeAssistant {
  connection: HassConnection;
  callWS?(msg: Record<string, unknown>): Promise<unknown>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ): Promise<unknown>;
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
}

export interface PanelProps {
  config?: PanelConfig;
}
