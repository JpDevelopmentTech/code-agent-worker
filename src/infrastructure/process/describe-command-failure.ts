import { STDERR_TAIL_LENGTH } from "../../shared/constants/process.constants";
import type { CommandResult } from "../../shared/types/command.types";
import { formatDuration } from "../../shared/utils/format-duration";
import { tailText } from "../../shared/utils/tail-text";

/** Explica en español por qué terminó mal un proceso, sin el final de stderr. */
function describeCause(result: CommandResult, timeoutMs: number): string {
  if (result.spawnError !== undefined) return `no se pudo arrancar (${result.spawnError})`;
  if (result.aborted) return "se canceló";
  if (result.timedOut) return `superó el tiempo máximo de ${formatDuration(timeoutMs)}`;
  if (result.exitCode === null) return "terminó por una señal";
  return `terminó con código ${result.exitCode}`;
}

/**
 * Construye un mensaje legible de fallo de un proceso: qué se intentaba,
 * por qué falló y el final de stderr, que es donde suele estar la causa.
 */
export function describeCommandFailure(
  action: string,
  result: CommandResult,
  timeoutMs: number,
): string {
  const cause = describeCause(result, timeoutMs);
  const stderr = tailText(result.stderr, STDERR_TAIL_LENGTH);
  return stderr === "" ? `${action}: ${cause}.` : `${action}: ${cause}. Detalle: ${stderr}`;
}
