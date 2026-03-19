export type UiSeverity = "debug" | "info" | "warning" | "error";

export function logClientEvent(
  severity: UiSeverity,
  stage: string,
  message: string,
  context: Record<string, unknown> = {}
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    source: "frontend",
    pipeline_stage: stage,
    severity,
    message,
    context,
  };
  const line = JSON.stringify(payload);
  if (severity === "error") {
    console.error(line);
    return;
  }
  if (severity === "warning") {
    console.warn(line);
    return;
  }
  console.log(line);
}

