import type { CodeAgent } from "../../domain/ports/code-agent.port";
import type { Logger } from "../../domain/ports/logger.port";
import type { PullRequestPublisher } from "../../domain/ports/pull-request-publisher.port";
import type { RunQueue } from "../../domain/ports/run-queue.port";
import type { SourceRepository } from "../../domain/ports/source-repository.port";
import type { TextRedactor } from "../../domain/ports/text-redactor.port";
import type { Workspace } from "../../domain/ports/workspace.port";

/** Puertos que necesita el pipeline de una ejecución (pasos de clonar a abrir el PR). */
export interface RunPipelineDependencies {
  sourceRepository: SourceRepository;
  codeAgent: CodeAgent;
  pullRequestPublisher: PullRequestPublisher;
}

/** Todo lo que se inyecta en el caso de uso que procesa la cola. */
export interface ProcessNextRunDependencies extends RunPipelineDependencies {
  runQueue: RunQueue;
  workspace: Workspace;
  redactor: TextRedactor;
  logger: Logger;
  heartbeatIntervalMs: number;
}
