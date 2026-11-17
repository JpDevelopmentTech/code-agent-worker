import type { RunArtifacts } from "../../domain/entities/run-artifacts.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";

/** Añade al informe el coste y los turnos de la sesión, si el agente los dio. */
export function withMetrics(report: RunFinishReport, artifacts: RunArtifacts): RunFinishReport {
  return {
    ...report,
    ...(artifacts.costUsd === undefined ? {} : { costUsd: artifacts.costUsd }),
    ...(artifacts.numTurns === undefined ? {} : { numTurns: artifacts.numTurns }),
  };
}
