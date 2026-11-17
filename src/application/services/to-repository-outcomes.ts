import type { RepositoryOutcome } from "../../domain/entities/repository-outcome.entity";
import type { RepositoryResult } from "../../domain/entities/repository-result.entity";

/** Traduce un resultado interno al formato del contrato, con el id de JOLUP. */
function toOutcome(result: RepositoryResult, repositoryId: string): RepositoryOutcome {
  if (result.outcome === "pr_opened") return { repositoryId, outcome: "pr_opened", prUrl: result.pullRequest.url };
  if (result.outcome === "failed") return { repositoryId, outcome: "failed", error: result.error };
  return { repositoryId, outcome: "no_changes" };
}

/**
 * Resultados por repositorio para `finish`. Devuelve `undefined` si a alguno le
 * falta el id: es un backend anterior a varios repos y no aceptaría el campo.
 */
export function toRepositoryOutcomes(results: readonly RepositoryResult[]): RepositoryOutcome[] | undefined {
  const outcomes: RepositoryOutcome[] = [];
  for (const result of results) {
    const id = result.checkout.repository.id;
    if (id === undefined) return undefined;
    outcomes.push(toOutcome(result, id));
  }
  return outcomes;
}
