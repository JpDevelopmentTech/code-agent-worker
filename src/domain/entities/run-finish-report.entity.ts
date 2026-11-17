import type { RepositoryOutcome } from "./repository-outcome.entity";

/** Lo que costó la sesión del agente, cuando llegó a terminar y lo dijo. */
export interface RunMetrics {
  costUsd?: number;
  numTurns?: number;
}

/** Datos comunes a cualquier cierre que haya llegado a procesar los repositorios. */
export interface RunReportDetails extends RunMetrics {
  /** Resultado de cada repositorio; no va si el backend no dio sus ids. */
  repositories?: RepositoryOutcome[];
}

/** Informe de una ejecución que terminó con al menos un Pull Request abierto. */
export interface RunDoneReport extends RunReportDetails {
  outcome: "done";
  prUrl: string;
  summary: string;
}

/** Informe de una ejecución que no pudo completarse. */
export interface RunFailedReport extends RunReportDetails {
  outcome: "failed";
  error: string;
  summary?: string;
}

/** Resultado final que el worker comunica al backend al cerrar una ejecución. */
export type RunFinishReport = RunDoneReport | RunFailedReport;
