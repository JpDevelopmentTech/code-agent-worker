import type { CommandRequest, CommandResult } from "../../shared/types/command.types";
import { CommandExecution } from "./command-execution";

/**
 * Ejecuta un proceso hijo con entorno explícito, tiempo máximo y cancelación.
 * Al vencer el tiempo o abortar envía SIGTERM a su grupo y, pasado el periodo
 * de gracia, SIGKILL. Al salir el hijo mata lo que quede de su grupo.
 * Nunca rechaza: devuelve un `CommandResult` que el llamador interpreta.
 */
export function runCommand(request: CommandRequest): Promise<CommandResult> {
  return new Promise((resolve) => new CommandExecution(request, resolve).run());
}
