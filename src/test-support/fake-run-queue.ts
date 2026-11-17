import type { CodeAgentRun } from "../domain/entities/code-agent-run.entity";
import type { FinishStatus, HeartbeatStatus } from "../domain/entities/heartbeat-status.entity";
import type { RunFinishReport } from "../domain/entities/run-finish-report.entity";
import type { RunQueue } from "../domain/ports/run-queue.port";

/** Cola en memoria: entrega una ejecución (o ninguna) y guarda lo que recibe. */
export class FakeRunQueue implements RunQueue {
  readonly finished: Array<{ runId: string; report: RunFinishReport }> = [];
  readonly transcripts: Array<{ runId: string; transcript: string }> = [];
  /** Orden de las llamadas de subida y cierre, para comprobar que la transcripción va antes. */
  readonly calls: string[] = [];
  uploadError: Error | undefined;
  heartbeats = 0;
  heartbeatStatus: HeartbeatStatus = "alive";
  finishStatus: FinishStatus = "recorded";

  /** Recibe la ejecución que devolverá el primer `claim`. */
  constructor(private pending: CodeAgentRun | null) {}

  /** Devuelve la ejecución pendiente una sola vez. */
  async claim(): Promise<CodeAgentRun | null> {
    const run = this.pending;
    this.pending = null;
    return run;
  }

  /** Cuenta el latido y responde con el estado configurado. */
  async heartbeat(): Promise<HeartbeatStatus> {
    this.heartbeats += 1;
    return this.heartbeatStatus;
  }

  /** Guarda la transcripción recibida, o falla si el test lo pide. */
  async uploadTranscript(runId: string, transcript: string): Promise<FinishStatus> {
    this.calls.push("transcript");
    if (this.uploadError !== undefined) throw this.uploadError;
    this.transcripts.push({ runId, transcript });
    return "recorded";
  }

  /** Guarda el informe recibido. */
  async finish(runId: string, report: RunFinishReport): Promise<FinishStatus> {
    this.calls.push("finish");
    this.finished.push({ runId, report });
    return this.finishStatus;
  }
}
