import type { ProcessNextRunUseCase } from "../application/use-cases/process-next-run.use-case";
import type { Logger } from "../domain/ports/logger.port";
import { describeError } from "../shared/utils/describe-error";
import { interruptibleSleep } from "../shared/utils/interruptible-sleep";

/**
 * Bucle principal: pide trabajo, lo procesa y vuelve a pedir. Duerme
 * `pollIntervalMs` cuando no hay trabajo o el backend falla; si procesó algo,
 * sigue sin esperar. `stop` corta el sueño y aborta la ejecución en curso.
 */
export class WorkerLoop {
  private readonly shutdown = new AbortController();

  /** Recibe el caso de uso, el logger y la pausa entre consultas vacías. */
  constructor(
    private readonly useCase: ProcessNextRunUseCase,
    private readonly logger: Logger,
    private readonly pollIntervalMs: number,
  ) {}

  /** Corre hasta que se llame a `stop`; resuelve cuando el bucle ha salido. */
  async run(): Promise<void> {
    this.logger.info("Worker en marcha", { pollIntervalMs: this.pollIntervalMs });
    while (!this.shutdown.signal.aborted) {
      const shouldWait = await this.tick();
      if (shouldWait) await interruptibleSleep(this.pollIntervalMs, this.shutdown.signal);
    }
    this.logger.info("Worker detenido");
  }

  /** Deja de pedir trabajo y aborta la ejecución en curso (sin informar al backend). */
  stop(): void {
    if (this.shutdown.signal.aborted) return;
    this.logger.info("Apagando el worker");
    this.shutdown.abort();
  }

  /** Una vuelta del bucle; devuelve si hay que esperar antes de la siguiente. */
  private async tick(): Promise<boolean> {
    try {
      const status = await this.useCase.execute(this.shutdown.signal);
      return status === "idle";
    } catch (error) {
      this.logger.error("Fallo al hablar con el backend; se reintentará", {
        error: describeError(error),
      });
      return true;
    }
  }
}
