import type { Logger } from "../../domain/ports/logger.port";
import type { RunQueue } from "../../domain/ports/run-queue.port";
import { describeError } from "../../shared/utils/describe-error";

/** Configuración de un heartbeat: qué ejecución renueva y qué hacer si se pierde. */
export interface RunHeartbeatOptions {
  runQueue: RunQueue;
  logger: Logger;
  runId: string;
  intervalMs: number;
  onLost: () => void;
}

/**
 * Renueva periódicamente el bloqueo de una ejecución en el backend.
 * Si el backend responde que ya no es nuestra, avisa con `onLost` y se detiene.
 * Un fallo de red no corta nada: el bloqueo dura más que varios intervalos.
 */
export class RunHeartbeat {
  private timer: ReturnType<typeof setInterval> | undefined;
  private beating = false;

  /** Guarda la configuración; el latido no empieza hasta `start`. */
  constructor(private readonly options: RunHeartbeatOptions) {}

  /** Arranca el latido periódico. */
  start(): void {
    this.timer = setInterval(() => void this.beat(), this.options.intervalMs);
  }

  /** Detiene el latido; se puede llamar varias veces. */
  stop(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }

  /** Envía un latido, sin solapar uno con otro si el backend tarda. */
  private async beat(): Promise<void> {
    if (this.beating || this.timer === undefined) return;
    this.beating = true;
    const { runQueue, logger, runId } = this.options;
    try {
      const status = await runQueue.heartbeat(runId);
      if (status === "lost") {
        logger.warn("La ejecución ya no es de este worker; se aborta", { runId });
        this.stop();
        this.options.onLost();
      }
    } catch (error) {
      logger.warn("No se pudo enviar el heartbeat", { runId, error: describeError(error) });
    } finally {
      this.beating = false;
    }
  }
}
