import type { OpenedPullRequest, PullRequestDraft } from "../domain/entities/pull-request.entity";
import type { PullRequestPublisher } from "../domain/ports/pull-request-publisher.port";

/** Publicador en memoria que devuelve una URL fija y guarda los borradores. */
export class FakePullRequestPublisher implements PullRequestPublisher {
  readonly drafts: PullRequestDraft[] = [];

  /** Recibe la URL que devolverá. */
  constructor(private readonly url = "https://github.com/jpdev/demo/pull/42") {}

  /** Guarda el borrador y devuelve la URL configurada. */
  async open(draft: PullRequestDraft): Promise<OpenedPullRequest> {
    this.drafts.push(draft);
    return { url: this.url };
  }
}
