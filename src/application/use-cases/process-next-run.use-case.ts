import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { RunArtifacts } from "../../domain/entities/run-artifacts.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import type { RunProcessingStatus } from "../../domain/entities/run-processing-status.entity";
import { ABORT_REASON_LOST, ABORT_REASON_SHUTDOWN } from "../../shared/constants/run.constants";
import { describeError } from "../../shared/utils/describe-error";
import type { ProcessNextRunDependencies } from "../interfaces/process-next-run.dependencies";
import { executeRunPipeline } from "../services/execute-run-pipeline";
import { RunHeartbeat } from "../services/run-heartbeat";
import { sanitizeReport } from "../services/sanitize-report";
import { withMetrics } from "../services/with-metrics";
import { toFailedReport } from "../services/to-failed-report";

/**
 * Caso de uso: toma la siguiente ejecución de la cola, la lleva hasta un PR
 * (o hasta un fallo explicado) e informa al backend. Una ejecución por llamada.
 * Si la ejecución se aborta (heartbeat perdido o apagado) no informa nada:
 * el backend la devuelve a la cola cuando vence el bloqueo.
 */
export class ProcessNextRunUseCase {
  /** Recibe todos los puertos ya construidos (inversión de dependencias). */
  constructor(private readonly deps: ProcessNextRunDependencies) {}

  /** Procesa como mucho una ejecución; `shutdownSignal` corta la que esté en curso. */
  async execute(shutdownSignal: AbortSignal): Promise<RunProcessingStatus> {
    const run = await this.deps.runQueue.claim();
    if (run === null) return "idle";
    this.deps.logger.info("Ejecución tomada", {
      runId: run.id,
      taskId: run.task.id,
      repository: run.repository.fullName,
      attempts: run.attempts,
    });

    const controller = new AbortController();
    const onShutdown = (): void => controller.abort(ABORT_REASON_SHUTDOWN);
    if (shutdownSignal.aborted) onShutdown();
    shutdownSignal.addEventListener("abort", onShutdown, { once: true });
    const heartbeat = new RunHeartbeat({
      runQueue: this.deps.runQueue,
      logger: this.deps.logger,
      runId: run.id,
      intervalMs: this.deps.heartbeatIntervalMs,
      onLost: () => controller.abort(ABORT_REASON_LOST),
    });
    heartbeat.start();

    try {
      const artifacts: RunArtifacts = {};
      const report = await this.runSafely(run, controller.signal, artifacts);
      if (controller.signal.aborted) {
        this.deps.logger.warn("Ejecución abortada; no se informa al backend", {
          runId: run.id,
          reason: describeError(controller.signal.reason),
        });
        return "aborted";
      }
      await this.uploadTranscript(run.id, artifacts.transcript);
      await this.report(run.id, withMetrics(report, artifacts));
      return report.outcome;
    } finally {
      heartbeat.stop();
      shutdownSignal.removeEventListener("abort", onShutdown);
    }
  }

  /** Corre el pipeline en un directorio temporal y lo borra pase lo que pase. */
  private async runSafely(
    run: CodeAgentRun,
    signal: AbortSignal,
    artifacts: RunArtifacts,
  ): Promise<RunFinishReport> {
    let directory: string | undefined;
    try {
      directory = await this.deps.workspace.create();
      return await executeRunPipeline(this.deps, run, directory, signal, artifacts);
    } catch (error) {
      return toFailedReport(error);
    } finally {
      if (directory !== undefined) await this.cleanUp(directory);
    }
  }

  /** Borra el directorio de trabajo; un fallo aquí se registra pero no tumba la ejecución. */
  private async cleanUp(directory: string): Promise<void> {
    try {
      await this.deps.workspace.remove(directory);
    } catch (error) {
      this.deps.logger.error("No se pudo borrar el directorio temporal", {
        directory,
        error: describeError(error),
      });
    }
  }

  /**
   * Sube la transcripción, sin secretos, antes de cerrar la ejecución. Es un
   * extra: si falla, se registra y la ejecución se cierra igual.
   */
  private async uploadTranscript(runId: string, transcript: string | undefined): Promise<void> {
    if (transcript === undefined) return;
    try {
      const status = await this.deps.runQueue.uploadTranscript(runId, this.deps.redactor.redact(transcript));
      if (status === "conflict") {
        this.deps.logger.warn("El backend no aceptó la transcripción: la ejecución ya no estaba en marcha", { runId });
      }
    } catch (error) {
      this.deps.logger.error("No se pudo subir la transcripción", { runId, error: describeError(error) });
    }
  }

  /** Envía el informe saneado y registra cómo respondió el backend. */
  private async report(runId: string, report: RunFinishReport): Promise<void> {
    const sanitized = sanitizeReport(report, this.deps.redactor);
    const status = await this.deps.runQueue.finish(runId, sanitized);
    const context =
      sanitized.outcome === "done"
        ? { runId, outcome: sanitized.outcome, prUrl: sanitized.prUrl }
        : { runId, outcome: sanitized.outcome, error: sanitized.error };
    if (status === "conflict") {
      this.deps.logger.warn("El backend ya no tenía la ejecución en marcha", context);
      return;
    }
    this.deps.logger.info("Ejecución cerrada", context);
  }
}
