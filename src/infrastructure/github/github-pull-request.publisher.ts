import type { OpenedPullRequest, PullRequestDraft } from "../../domain/entities/pull-request.entity";
import { RunStepError } from "../../domain/errors/run-step.error";
import type { PullRequestPublisher } from "../../domain/ports/pull-request-publisher.port";
import {
  GITHUB_ACCEPT_HEADER,
  GITHUB_API_URL,
  GITHUB_API_VERSION,
  GITHUB_REQUEST_TIMEOUT_MS,
} from "../../shared/constants/github.constants";
import { describeError } from "../../shared/utils/describe-error";
import { parseJsonOrUndefined } from "../../shared/utils/parse-json-or-undefined";
import { describeGithubError } from "./describe-github-error";
import { githubPullRequestSchema } from "./github-pull-request.schema";

/** Abre Pull Requests con la API REST de GitHub. */
export class GithubPullRequestPublisher implements PullRequestPublisher {
  /** Recibe el token de GitHub (PAT de grano fino con Pull requests: write). */
  constructor(private readonly githubToken: string) {}

  /** Crea el PR y devuelve su URL; lanza `RunStepError` si GitHub lo rechaza. */
  async open(draft: PullRequestDraft, signal: AbortSignal): Promise<OpenedPullRequest> {
    const response = await this.request(draft, signal);
    const bodyText = await response.text();
    if (!response.ok) throw new RunStepError(describeGithubError(response.status, bodyText));
    const parsed = githubPullRequestSchema.safeParse(parseJsonOrUndefined(bodyText));
    if (!parsed.success) {
      throw new RunStepError("GitHub creó el Pull Request pero su respuesta no trae html_url.");
    }
    return { url: parsed.data.html_url };
  }

  /** Hace la llamada HTTP; un fallo de red se traduce en `RunStepError`. */
  private async request(draft: PullRequestDraft, signal: AbortSignal): Promise<Response> {
    try {
      return await fetch(`${GITHUB_API_URL}/repos/${draft.repositoryFullName}/pulls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          Accept: GITHUB_ACCEPT_HEADER,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          head: draft.head,
          base: draft.base,
          body: draft.body,
          draft: false,
        }),
        signal: AbortSignal.any([signal, AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS)]),
      });
    } catch (error) {
      throw new RunStepError(`No se pudo contactar con GitHub: ${describeError(error)}`);
    }
  }
}
