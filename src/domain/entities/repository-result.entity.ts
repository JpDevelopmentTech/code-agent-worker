import type { OpenedPullRequest } from "./pull-request.entity";
import type { RepositoryCheckout } from "./repository-checkout.entity";

/** Repositorio con commits nuevos cuyo PR se abrió; guarda el cuerpo para poder ampliarlo. */
export interface OpenedRepositoryResult {
  checkout: RepositoryCheckout;
  outcome: "pr_opened";
  pullRequest: OpenedPullRequest;
  body: string;
}

/** Repositorio sin commits nuevos. */
export interface UnchangedRepositoryResult {
  checkout: RepositoryCheckout;
  outcome: "no_changes";
}

/** Repositorio con commits cuyo push o PR falló. */
export interface FailedRepositoryResult {
  checkout: RepositoryCheckout;
  outcome: "failed";
  error: string;
}

/** Lo que pasó con un repositorio después de que terminara el agente. */
export type RepositoryResult =
  | OpenedRepositoryResult
  | UnchangedRepositoryResult
  | FailedRepositoryResult;
