import type { AgentResult } from "../../domain/entities/agent-result.entity";
import type { RunTask } from "../../domain/entities/code-agent-run.entity";
import type { RepositoryCheckout } from "../../domain/entities/repository-checkout.entity";
import type { RunArtifacts } from "../../domain/entities/run-artifacts.entity";
import type { CodeAgent } from "../../domain/ports/code-agent.port";
import { buildMultiRepoTaskPrompt } from "../../domain/services/build-multi-repo-task-prompt.service";
import { buildTaskPrompt } from "../../domain/services/build-task-prompt.service";

/** Dónde trabaja el agente y con qué prompt. */
interface AgentWorkplace {
  workingDirectory: string;
  prompt: string;
}

/**
 * Con un repositorio el agente trabaja dentro del clon, como siempre; con varios,
 * en la carpeta que los contiene y con el prompt que los enumera.
 */
function chooseWorkplace(task: RunTask, checkouts: RepositoryCheckout[], parentDirectory: string): AgentWorkplace {
  const [only] = checkouts;
  if (checkouts.length === 1 && only !== undefined) {
    return { workingDirectory: only.directory, prompt: buildTaskPrompt(task) };
  }
  return { workingDirectory: parentDirectory, prompt: buildMultiRepoTaskPrompt(task, checkouts) };
}

/**
 * Corre al agente sobre los clones y deja en `artifacts` la transcripción y las
 * métricas en cuanto las tiene, para que no se pierdan si un paso posterior falla.
 */
export async function runCodeAgent(
  codeAgent: CodeAgent,
  task: RunTask,
  checkouts: RepositoryCheckout[],
  parentDirectory: string,
  signal: AbortSignal,
  artifacts: RunArtifacts,
): Promise<AgentResult> {
  const agentResult = await codeAgent.run({
    ...chooseWorkplace(task, checkouts, parentDirectory),
    signal,
    onTranscript: (transcript) => {
      artifacts.transcript = transcript;
    },
  });
  if (agentResult.costUsd !== undefined) artifacts.costUsd = agentResult.costUsd;
  if (agentResult.turns !== undefined) artifacts.numTurns = agentResult.turns;
  return agentResult;
}
