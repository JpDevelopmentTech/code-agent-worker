/** Lo que costó la sesión del agente, cuando llegó a terminar y lo dijo. */
export interface RunMetrics {
  costUsd?: number;
  numTurns?: number;
}

/** Informe de una ejecución que terminó con un Pull Request abierto. */
export interface RunDoneReport extends RunMetrics {
  outcome: "done";
  prUrl: string;
  summary: string;
}

/** Informe de una ejecución que no pudo completarse. */
export interface RunFailedReport extends RunMetrics {
  outcome: "failed";
  error: string;
  summary?: string;
}

/** Resultado final que el worker comunica al backend al cerrar una ejecución. */
export type RunFinishReport = RunDoneReport | RunFailedReport;
