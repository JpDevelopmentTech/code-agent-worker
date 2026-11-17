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
  /** Número del PR dentro de su repositorio; sirve para editarlo después. */
  number: number;
}

/** Identifica un Pull Request existente para modificarlo. */
export interface PullRequestReference {
  repositoryFullName: string;
  number: number;
}
