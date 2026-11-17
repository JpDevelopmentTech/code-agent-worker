/** Informe de una ejecución que terminó con un Pull Request abierto. */
export interface RunDoneReport {
  outcome: "done";
  prUrl: string;
  summary: string;
}

/** Informe de una ejecución que no pudo completarse. */
export interface RunFailedReport {
  outcome: "failed";
  error: string;
  summary?: string;
}

/** Resultado final que el worker comunica al backend al cerrar una ejecución. */
export type RunFinishReport = RunDoneReport | RunFailedReport;
