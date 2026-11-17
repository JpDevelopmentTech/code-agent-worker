import type {
  OpenedPullRequest,
  PullRequestDraft,
  PullRequestReference,
} from "../domain/entities/pull-request.entity";
import type { PullRequestPublisher } from "../domain/ports/pull-request-publisher.port";

/** Número que reciben todos los PRs del fake (cada uno en su repositorio). */
export const FAKE_PR_NUMBER = 42;

/** URL que devuelve el fake para el PR de un repositorio. */
export function fakePullRequestUrl(repositoryFullName: string): string {
  return `https://github.com/${repositoryFullName}/pull/${FAKE_PR_NUMBER}`;
}

/** Publicador en memoria: guarda los borradores y las ediciones, y falla si el test lo pide. */
export class FakePullRequestPublisher implements PullRequestPublisher {
  readonly drafts: PullRequestDraft[] = [];
  readonly bodyUpdates: Array<{ reference: PullRequestReference; body: string }> = [];
  /** Error al abrir el PR, por `owner/repo`. */
  readonly openErrors: Record<string, Error> = {};
  updateError: Error | undefined;

  /** Guarda el borrador y devuelve una URL derivada del repositorio. */
  async open(draft: PullRequestDraft): Promise<OpenedPullRequest> {
    this.drafts.push(draft);
    const error = this.openErrors[draft.repositoryFullName];
    if (error !== undefined) throw error;
    return { url: fakePullRequestUrl(draft.repositoryFullName), number: FAKE_PR_NUMBER };
  }

  /** Guarda la nueva descripción, o falla si el test lo pide. */
  async updateBody(reference: PullRequestReference, body: string): Promise<void> {
    if (this.updateError !== undefined) throw this.updateError;
    this.bodyUpdates.push({ reference, body });
  }
}
