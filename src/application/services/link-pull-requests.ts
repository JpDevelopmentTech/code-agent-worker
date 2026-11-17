import type { RepositoryResult } from "../../domain/entities/repository-result.entity";
import { buildRelatedPullRequestsSection } from "../../domain/services/build-related-pull-requests-section.service";
import { selectOpenedResults } from "../../domain/services/select-opened-results.service";
import { describeError } from "../../shared/utils/describe-error";
import type { RunPipelineDependencies } from "../interfaces/process-next-run.dependencies";

/**
 * Si la tarea abrió más de un PR, añade al final de cada uno la sección con los
 * enlaces a los demás. Es un extra: si GitHub rechaza una edición se registra
 * y se sigue, sin cambiar el resultado de la ejecución.
 */
export async function linkPullRequests(
  deps: Pick<RunPipelineDependencies, "pullRequestPublisher" | "logger">,
  results: readonly RepositoryResult[],
  signal: AbortSignal,
): Promise<void> {
  const opened = selectOpenedResults(results);
  if (opened.length < 2) return;
  for (const current of opened) {
    signal.throwIfAborted();
    const related = opened
      .filter((other) => other !== current)
      .map((other) => ({ repositoryFullName: other.checkout.repository.fullName, url: other.pullRequest.url }));
    const body = `${current.body}\n\n${buildRelatedPullRequestsSection(related)}`;
    const reference = { repositoryFullName: current.checkout.repository.fullName, number: current.pullRequest.number };
    try {
      await deps.pullRequestPublisher.updateBody(reference, body, signal);
    } catch (error) {
      deps.logger.warn("No se pudo enlazar el PR con los demás de la tarea", {
        prUrl: current.pullRequest.url,
        error: describeError(error),
      });
    }
  }
}
