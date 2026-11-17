/** Datos necesarios para abrir un Pull Request. */
export interface PullRequestDraft {
  repositoryFullName: string;
  title: string;
  head: string;
  base: string;
  body: string;
}

/** Pull Request ya creado en el proveedor de código. */
export interface OpenedPullRequest {
  url: string;
}
