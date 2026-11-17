import type { OpenedRepositoryResult, RepositoryResult } from "../entities/repository-result.entity";

/** Devuelve, en orden, los repositorios que terminaron con un PR abierto. */
export function selectOpenedResults(results: readonly RepositoryResult[]): OpenedRepositoryResult[] {
  return results.flatMap((result) => (result.outcome === "pr_opened" ? [result] : []));
}
