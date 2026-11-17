import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import {
  KILL_GRACE_PERIOD_MS,
  MAX_CAPTURED_OUTPUT_BYTES,
} from "../../shared/constants/process.constants";
import type { CommandRequest, CommandResult } from "../../shared/types/command.types";
import { OutputBuffer } from "./output-buffer";
import { signalProcessGroup } from "./signal-process-group";

/**
 * Una ejecución de un proceso hijo: lo lanza, recoge su salida, aplica el
 * tiempo máximo y la cancelación, y resuelve una sola vez con el resultado.
 */
export class CommandExecution {
  private readonly stdout: OutputBuffer;
  private readonly stderr = new OutputBuffer(MAX_CAPTURED_OUTPUT_BYTES);
  private timedOut = false;
  private aborted = false;
  private spawnError: string | undefined;
  private settled = false;
  private child: ChildProcessWithoutNullStreams | undefined;
  private timeoutTimer: NodeJS.Timeout | undefined;
  private killTimer: NodeJS.Timeout | undefined;
  private readonly onAbort = (): void => {
    this.aborted = true;
    this.terminate();
  };

  /** Prepara la ejecución; el proceso no arranca hasta `run`. */
  constructor(
    private readonly request: CommandRequest,
    private readonly resolve: (result: CommandResult) => void,
  ) {
    this.stdout = new OutputBuffer(request.maxStdoutBytes ?? MAX_CAPTURED_OUTPUT_BYTES);
  }

  /** Lanza el proceso como líder de su propio grupo y conecta todos los eventos. */
  run(): void {
    const { request } = this;
    const child = spawn(request.command, [...request.args], {
      cwd: request.cwd,
      env: { ...request.env },
      detached: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.attach(child);
    this.timeoutTimer = setTimeout(() => {
      this.timedOut = true;
      this.terminate(child);
    }, request.timeoutMs);
    if (request.signal.aborted) this.onAbort();
    else request.signal.addEventListener("abort", this.onAbort, { once: true });
    child.stdin.end(request.stdin ?? "");
  }

  /** Conecta la salida, los errores y el cierre del proceso. */
  private attach(child: ChildProcessWithoutNullStreams): void {
    this.child = child;
    child.stdout.on("data", (chunk: Buffer) => this.stdout.append(chunk));
    child.stderr.on("data", (chunk: Buffer) => this.stderr.append(chunk));
    child.stdin.on("error", (error) => this.stderr.append(Buffer.from(`\n[stdin] ${error.message}\n`)));
    child.on("error", (error) => {
      this.spawnError = error.message;
      if (child.pid === undefined) this.settle(null);
    });
    child.on("exit", () => signalProcessGroup(child, "SIGKILL"));
    child.on("close", (code) => this.settle(code));
  }

  /** SIGTERM al grupo y, si no se va en el periodo de gracia, SIGKILL. */
  private terminate(child = this.child): void {
    if (child === undefined || this.killTimer !== undefined) return;
    signalProcessGroup(child, "SIGTERM");
    this.killTimer = setTimeout(() => signalProcessGroup(child, "SIGKILL"), KILL_GRACE_PERIOD_MS);
  }

  /** Libera temporizadores y escuchas y entrega el resultado (solo la primera vez). */
  private settle(exitCode: number | null): void {
    if (this.settled) return;
    this.settled = true;
    clearTimeout(this.timeoutTimer);
    clearTimeout(this.killTimer);
    this.request.signal.removeEventListener("abort", this.onAbort);
    this.resolve({
      exitCode,
      stdout: this.stdout.toString(),
      stderr: this.stderr.toString(),
      timedOut: this.timedOut,
      aborted: this.aborted,
      ...(this.spawnError === undefined ? {} : { spawnError: this.spawnError }),
    });
  }
}
