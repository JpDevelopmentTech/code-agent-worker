import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { RepositoryResult } from "../../domain/entities/repository-result.entity";
import type { RunArtifacts } from "../../domain/entities/run-artifacts.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import type { RunPipelineDependencies } from "../interfaces/process-next-run.dependencies";
import { buildRunOutcome } from "./build-run-outcome";
import { linkPullRequests } from "./link-pull-requests";
import { prepareCheckouts } from "./prepare-checkouts";
import { publishRepository } from "./publish-repository";
import { runCodeAgent } from "./run-code-agent";

/**
 * Ejecuta los pasos de una ejecución sobre un directorio ya creado: clonar cada
 * repositorio y preparar su rama, correr al agente y, repo por repo, comprobar
 * commits, subir la rama y abrir el PR; al final enlaza los PRs entre sí.
 * Lanza si falla clonar o el agente; el fallo de un repo no detiene a los demás.
 */
export async function executeRunPipeline(
  deps: RunPipelineDependencies,
  run: CodeAgentRun,
  directory: string,
  signal: AbortSignal,
  artifacts: RunArtifacts,
): Promise<RunFinishReport> {
  const checkouts = await prepareCheckouts(deps.sourceRepository, run, directory, signal);
  const agentResult = await runCodeAgent(deps.codeAgent, run.task, checkouts, directory, signal, artifacts);

  const results: RepositoryResult[] = [];
  for (const checkout of checkouts) {
    signal.throwIfAborted();
    const result = await publishRepository(deps, run, checkout, agentResult.summary, signal);
    deps.logger.info("Repositorio procesado", {
      runId: run.id,
      repository: checkout.repository.fullName,
      outcome: result.outcome,
      ...(result.outcome === "pr_opened" ? { prUrl: result.pullRequest.url } : {}),
      ...(result.outcome === "failed" ? { error: result.error } : {}),
    });
    results.push(result);
  }
  await linkPullRequests(deps, results, signal);
  return buildRunOutcome(results, agentResult.summary);
}
