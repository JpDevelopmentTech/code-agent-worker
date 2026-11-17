import type {
  OpenedPullRequest,
  PullRequestDraft,
  PullRequestReference,
} from "../entities/pull-request.entity";

/** Proveedor donde se abren los Pull Requests (GitHub). */
export interface PullRequestPublisher {
  /** Abre el PR y devuelve su URL; lanza un error legible si el proveedor lo rechaza. */
  open(draft: PullRequestDraft, signal: AbortSignal): Promise<OpenedPullRequest>;
  /** Sustituye la descripción de un PR ya abierto; lanza un error legible si falla. */
  updateBody(reference: PullRequestReference, body: string, signal: AbortSignal): Promise<void>;
}
