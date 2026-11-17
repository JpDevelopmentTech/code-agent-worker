import type { CodeAgentRun } from "../entities/code-agent-run.entity";
import type { FinishStatus, HeartbeatStatus } from "../entities/heartbeat-status.entity";
import type { RunFinishReport } from "../entities/run-finish-report.entity";

/** Cola de ejecuciones del backend de JOLUP. */
export interface RunQueue {
  /** Toma la siguiente ejecución pendiente; `null` si la cola está vacía. */
  claim(): Promise<CodeAgentRun | null>;
  /** Renueva el bloqueo de la ejecución para que el backend no la dé por perdida. */
  heartbeat(runId: string): Promise<HeartbeatStatus>;
  /** Cierra la ejecución con su resultado final. */
  finish(runId: string, report: RunFinishReport): Promise<FinishStatus>;
}
