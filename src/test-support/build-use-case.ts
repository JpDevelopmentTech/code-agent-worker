import { ProcessNextRunUseCase } from "../application/use-cases/process-next-run.use-case";
import type { AgentResult } from "../domain/entities/agent-result.entity";
import type { CodeAgentRun } from "../domain/entities/code-agent-run.entity";
import type { CodeAgentRequest } from "../domain/ports/code-agent.port";
import { FakeCodeAgent } from "./fake-code-agent";
import { FakeLogger } from "./fake-logger";
import { FakePullRequestPublisher } from "./fake-pull-request-publisher";
import { FakeRedactor } from "./fake-redactor";
import { FakeRunQueue } from "./fake-run-queue";
import { FakeSourceRepository } from "./fake-source-repository";
import { FakeWorkspace } from "./fake-workspace";

/** Opciones para montar el caso de uso con fakes. */
export interface UseCaseHarnessOptions {
  run: CodeAgentRun | null;
  agent?: (request: CodeAgentRequest) => Promise<AgentResult>;
  heartbeatIntervalMs?: number;
}

/** Caso de uso montado junto a los fakes que usa, para inspeccionarlos. */
export interface UseCaseHarness {
  useCase: ProcessNextRunUseCase;
  queue: FakeRunQueue;
  workspace: FakeWorkspace;
  repository: FakeSourceRepository;
  agent: FakeCodeAgent;
  publisher: FakePullRequestPublisher;
  logger: FakeLogger;
}

/** Monta `ProcessNextRunUseCase` con todos los puertos en memoria y los devuelve. */
export function buildUseCaseHarness(options: UseCaseHarnessOptions): UseCaseHarness {
  const queue = new FakeRunQueue(options.run);
  const workspace = new FakeWorkspace();
  const repository = new FakeSourceRepository();
  const agent = new FakeCodeAgent(
    options.agent ?? (async () => ({ summary: "Añadí la validación y pasé los tests." })),
  );
  const publisher = new FakePullRequestPublisher();
  const logger = new FakeLogger();
  const useCase = new ProcessNextRunUseCase({
    runQueue: queue,
    workspace,
    sourceRepository: repository,
    codeAgent: agent,
    pullRequestPublisher: publisher,
    redactor: new FakeRedactor(),
    logger,
    heartbeatIntervalMs: options.heartbeatIntervalMs ?? 60_000,
  });
  return { useCase, queue, workspace, repository, agent, publisher, logger };
}
