/** El repositorio terminó con un Pull Request abierto. */
export interface RepositoryPrOpened {
  repositoryId: string;
  outcome: "pr_opened";
  prUrl: string;
}

/** El agente no dejó commits en el repositorio. */
export interface RepositoryNoChanges {
  repositoryId: string;
  outcome: "no_changes";
}

/** Falló subir la rama o abrir el PR de ese repositorio. */
export interface RepositoryFailed {
  repositoryId: string;
  outcome: "failed";
  error: string;
}

/** Resultado de un repositorio tal como se informa al backend en `finish`. */
export type RepositoryOutcome = RepositoryPrOpened | RepositoryNoChanges | RepositoryFailed;
