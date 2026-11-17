import { ProcessNextRunUseCase } from "../application/use-cases/process-next-run.use-case";
import type { Logger } from "../domain/ports/logger.port";
import { ClaudeCodeAgent } from "./claude/claude-code.agent";
import type { WorkerEnv } from "./config/env";
import { encodeGithubBasicCredentials } from "./git/github-basic-credentials";
import { GitCliRepository } from "./git/git-cli.repository";
import { GithubPullRequestPublisher } from "./github/github-pull-request.publisher";
import { BackendHttpClient } from "./http/backend-http.client";
import { JolupRunQueueClient } from "./http/jolup-run-queue.client";
import { JsonLogger } from "./logging/json-logger";
import { readChildBaseEnv } from "./process/read-child-base-env";
import { SecretRedactor } from "./security/secret-redactor";
import { TempWorkspace } from "./workspace/temp-workspace";
import { WorkerLoop } from "./worker-loop";

/** Piezas ya conectadas que necesita `main`. */
export interface BuiltWorker {
  loop: WorkerLoop;
  logger: Logger;
}

/**
 * Raíz de composición: construye los adaptadores a partir de la configuración
 * y los inyecta en el caso de uso y en el bucle. Es el único sitio que conoce
 * las implementaciones concretas.
 */
export function buildWorker(env: WorkerEnv, processEnv: NodeJS.ProcessEnv): BuiltWorker {
  const redactor = new SecretRedactor([
    env.GITHUB_TOKEN,
    env.CODE_AGENT_WORKER_TOKEN,
    env.CLAUDE_CODE_OAUTH_TOKEN,
    encodeGithubBasicCredentials(env.GITHUB_TOKEN),
  ]);
  const logger = new JsonLogger(redactor);
  const baseEnv = readChildBaseEnv(processEnv);
  const useCase = new ProcessNextRunUseCase({
    runQueue: new JolupRunQueueClient(
      new BackendHttpClient(env.JOLUP_API_URL, env.CODE_AGENT_WORKER_TOKEN),
    ),
    workspace: new TempWorkspace(env.WORK_DIR),
    sourceRepository: new GitCliRepository({
      githubToken: env.GITHUB_TOKEN,
      authorName: env.GIT_AUTHOR_NAME,
      authorEmail: env.GIT_AUTHOR_EMAIL,
      baseEnv,
    }),
    codeAgent: new ClaudeCodeAgent({
      oauthToken: env.CLAUDE_CODE_OAUTH_TOKEN,
      timeoutMs: env.RUN_TIMEOUT_MS,
      baseEnv,
      ...(env.CLAUDE_MODEL === undefined ? {} : { model: env.CLAUDE_MODEL }),
      ...(env.CLAUDE_EFFORT === undefined ? {} : { effort: env.CLAUDE_EFFORT }),
      ...(env.CLAUDE_MAX_TURNS === undefined ? {} : { maxTurns: env.CLAUDE_MAX_TURNS }),
    }),
    pullRequestPublisher: new GithubPullRequestPublisher(env.GITHUB_TOKEN),
    redactor,
    logger,
    heartbeatIntervalMs: env.HEARTBEAT_INTERVAL_MS,
  });
  return { loop: new WorkerLoop(useCase, logger, env.POLL_INTERVAL_MS), logger };
}
