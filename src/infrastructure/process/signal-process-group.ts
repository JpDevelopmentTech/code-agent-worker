import type { ChildProcess } from "node:child_process";

/**
 * Envía una señal a todo el grupo de procesos del hijo (el hijo se lanza con
 * `detached`, así que es líder de su grupo). Así mueren también los nietos:
 * comandos, tests o servidores que Claude haya dejado en marcha.
 * Si el grupo ya no existe (ESRCH) no hay nada que hacer; ante otro error
 * se recurre a matar solo al hijo.
 */
export function signalProcessGroup(child: ChildProcess, signal: NodeJS.Signals): void {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ESRCH") return;
    child.kill(signal);
  }
}
