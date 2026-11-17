import type {
  OpenedPullRequest,
  PullRequestDraft,
  PullRequestReference,
} from "../../domain/entities/pull-request.entity";
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

/** Abre y edita Pull Requests con la API REST de GitHub. */
export class GithubPullRequestPublisher implements PullRequestPublisher {
  /** Recibe el token de GitHub (PAT de grano fino con Pull requests: write). */
  constructor(private readonly githubToken: string) {}

  /** Crea el PR y devuelve su URL y su número; lanza `RunStepError` si GitHub lo rechaza. */
  async open(draft: PullRequestDraft, signal: AbortSignal): Promise<OpenedPullRequest> {
    const { repositoryFullName, title, head, base, body } = draft;
    const payload = { title, head, base, body, draft: false };
    const bodyText = await this.send("POST", `/repos/${repositoryFullName}/pulls`, payload, signal);
    const parsed = githubPullRequestSchema.safeParse(parseJsonOrUndefined(bodyText));
    if (!parsed.success) {
      throw new RunStepError("GitHub creó el Pull Request pero su respuesta no trae html_url ni number.");
    }
    return { url: parsed.data.html_url, number: parsed.data.number };
  }

  /** Sustituye la descripción de un PR (`PATCH /pulls/:number`); lanza `RunStepError` si falla. */
  async updateBody(reference: PullRequestReference, body: string, signal: AbortSignal): Promise<void> {
    const path = `/repos/${reference.repositoryFullName}/pulls/${reference.number}`;
    await this.send("PATCH", path, { body }, signal);
  }

  /** Llama a la API y devuelve el cuerpo; un código de error se traduce en `RunStepError`. */
  private async send(method: string, path: string, payload: object, signal: AbortSignal): Promise<string> {
    const response = await this.request(method, path, payload, signal);
    const bodyText = await response.text();
    if (!response.ok) throw new RunStepError(describeGithubError(response.status, bodyText));
    return bodyText;
  }

  /** Hace la llamada HTTP; un fallo de red se traduce en `RunStepError`. */
  private async request(method: string, path: string, payload: object, signal: AbortSignal): Promise<Response> {
    try {
      return await fetch(`${GITHUB_API_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          Accept: GITHUB_ACCEPT_HEADER,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([signal, AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS)]),
      });
    } catch (error) {
      throw new RunStepError(`No se pudo contactar con GitHub: ${describeError(error)}`);
    }
  }
}
