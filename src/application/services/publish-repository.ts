import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { RepositoryCheckout } from "../../domain/entities/repository-checkout.entity";
import type { RepositoryResult } from "../../domain/entities/repository-result.entity";
import { buildPullRequestBody } from "../../domain/services/build-pull-request-body.service";
import type { RunPipelineDependencies } from "../interfaces/process-next-run.dependencies";
import { toFailedReport } from "./to-failed-report";

/**
 * Lleva un repositorio desde los commits del agente hasta su PR: sin commits
 * nuevos → `no_changes`; con commits → push y PR → `pr_opened`. Si algo falla
 * devuelve `failed` con el motivo en vez de lanzar, para que los demás
 * repositorios sigan su curso. Solo relanza si la ejecución se está abortando.
 */
export async function publishRepository(
  deps: RunPipelineDependencies,
  run: CodeAgentRun,
  checkout: RepositoryCheckout,
  summary: string,
  signal: AbortSignal,
): Promise<RepositoryResult> {
  const { directory, repository } = checkout;
  try {
    const newCommits = await deps.sourceRepository.countNewCommits(directory, repository.baseBranch, signal);
    if (newCommits === 0) return { checkout, outcome: "no_changes" };
    await deps.sourceRepository.push(directory, run.branch, signal);
    const body = buildPullRequestBody(summary, run.task.id);
    const pullRequest = await deps.pullRequestPublisher.open(
      {
        repositoryFullName: repository.fullName,
        title: run.task.title,
        head: run.branch,
        base: repository.baseBranch,
        body,
      },
      signal,
    );
    return { checkout, outcome: "pr_opened", pullRequest, body };
  } catch (error) {
    if (signal.aborted) throw error;
    return { checkout, outcome: "failed", error: toFailedReport(error).error };
  }
}
