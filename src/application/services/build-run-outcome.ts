import type { FailedRepositoryResult, RepositoryResult } from "../../domain/entities/repository-result.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import { selectOpenedResults } from "../../domain/services/select-opened-results.service";
import { NO_CHANGES_ERROR } from "../../shared/constants/run.constants";
import { toRepositoryOutcomes } from "./to-repository-outcomes";

/** Error global a partir del primer repo que falló; con varios repos dice cuál fue. */
function describeFirstFailure(failed: FailedRepositoryResult, repositoryCount: number): string {
  if (repositoryCount === 1) return failed.error;
  return `${failed.checkout.repository.fullName}: ${failed.error}`;
}

/**
 * Decide el desenlace de la ejecución a partir de cada repositorio:
 * algún PR → `done` con el primero; ninguno y todos sin cambios → «El agente no
 * hizo cambios.»; ninguno y alguno falló → `failed` con el primer error.
 */
export function buildRunOutcome(results: readonly RepositoryResult[], summary: string): RunFinishReport {
  const repositories = toRepositoryOutcomes(results);
  const details = repositories === undefined ? {} : { repositories };
  const [firstOpened] = selectOpenedResults(results);
  if (firstOpened !== undefined) {
    return { outcome: "done", prUrl: firstOpened.pullRequest.url, summary, ...details };
  }
  const failed = results.find((result): result is FailedRepositoryResult => result.outcome === "failed");
  const error = failed === undefined ? NO_CHANGES_ERROR : describeFirstFailure(failed, results.length);
  return { outcome: "failed", error, summary, ...details };
}
