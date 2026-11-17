import { PR_RELATED_SECTION_TITLE } from "../../shared/constants/pull-request.constants";

/** PR de otro repositorio de la misma tarea, para enlazarlo. */
export interface RelatedPullRequest {
  repositoryFullName: string;
  url: string;
}

/**
 * Arma la sección «PRs de esta misma tarea» que se añade al final de cada PR
 * cuando la tarea abrió más de uno, para que quien revise vea los demás.
 */
export function buildRelatedPullRequestsSection(related: readonly RelatedPullRequest[]): string {
  const lines = related.map(({ repositoryFullName, url }) => `- ${repositoryFullName}: ${url}`);
  return [PR_RELATED_SECTION_TITLE, lines.join("\n")].join("\n\n");
}
