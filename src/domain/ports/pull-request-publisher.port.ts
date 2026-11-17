import type { OpenedPullRequest, PullRequestDraft } from "../entities/pull-request.entity";

/** Proveedor donde se abren los Pull Requests (GitHub). */
export interface PullRequestPublisher {
  /** Abre el PR y devuelve su URL; lanza un error legible si el proveedor lo rechaza. */
  open(draft: PullRequestDraft, signal: AbortSignal): Promise<OpenedPullRequest>;
}
