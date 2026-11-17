import type { CodeAgentRun } from "../entities/code-agent-run.entity";
import type { FinishStatus, HeartbeatStatus } from "../entities/heartbeat-status.entity";
import type { RunFinishReport } from "../entities/run-finish-report.entity";

/** Cola de ejecuciones del backend de JOLUP. */
export interface RunQueue {
  /** Toma la siguiente ejecución pendiente; `null` si la cola está vacía. */
  claim(): Promise<CodeAgentRun | null>;
  /** Renueva el bloqueo de la ejecución para que el backend no la dé por perdida. */
  heartbeat(runId: string): Promise<HeartbeatStatus>;
  /**
   * Guarda la transcripción de la sesión del agente. Va antes de `finish`: el
   * backend solo la acepta mientras la ejecución sigue en marcha. `conflict` si
   * ya no lo estaba.
   */
  uploadTranscript(runId: string, transcript: string): Promise<FinishStatus>;
  /** Cierra la ejecución con su resultado final. */
  finish(runId: string, report: RunFinishReport): Promise<FinishStatus>;
}
