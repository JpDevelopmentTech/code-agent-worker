import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { RunArtifacts } from "../../domain/entities/run-artifacts.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import { buildPullRequestBody } from "../../domain/services/build-pull-request-body.service";
import { buildTaskPrompt } from "../../domain/services/build-task-prompt.service";
import { NO_CHANGES_ERROR } from "../../shared/constants/run.constants";
import type { RunPipelineDependencies } from "../interfaces/process-next-run.dependencies";

/**
 * Ejecuta los pasos de una ejecución sobre un directorio ya creado:
 * clonar, preparar la rama, correr al agente, comprobar commits, subir la rama
 * y abrir el PR. Lanza si un paso falla; devuelve `failed` si no hubo cambios.
 * Deja en `artifacts` la transcripción y las métricas del agente en cuanto las
 * tiene, para que no se pierdan si un paso posterior falla.
 */
export async function executeRunPipeline(
  deps: RunPipelineDependencies,
  run: CodeAgentRun,
  directory: string,
  signal: AbortSignal,
  artifacts: RunArtifacts,
): Promise<RunFinishReport> {
  const { sourceRepository, codeAgent, pullRequestPublisher } = deps;
  const { fullName, baseBranch } = run.repository;

  await sourceRepository.clone({ directory, repositoryFullName: fullName, baseBranch }, signal);
  await sourceRepository.prepareBranch(directory, run.branch, signal);

  const prompt = buildTaskPrompt(run.task);
  const agentResult = await codeAgent.run({
    workingDirectory: directory,
    prompt,
    signal,
    onTranscript: (transcript) => {
      artifacts.transcript = transcript;
    },
  });
  if (agentResult.costUsd !== undefined) artifacts.costUsd = agentResult.costUsd;
  if (agentResult.turns !== undefined) artifacts.numTurns = agentResult.turns;

  const newCommits = await sourceRepository.countNewCommits(directory, baseBranch, signal);
  if (newCommits === 0) {
    return { outcome: "failed", error: NO_CHANGES_ERROR, summary: agentResult.summary };
  }

  await sourceRepository.push(directory, run.branch, signal);
  const pullRequest = await pullRequestPublisher.open(
    {
      repositoryFullName: fullName,
      title: run.task.title,
      head: run.branch,
      base: baseBranch,
      body: buildPullRequestBody(agentResult.summary, run.task.id),
    },
    signal,
  );
  return { outcome: "done", prUrl: pullRequest.url, summary: agentResult.summary };
}
