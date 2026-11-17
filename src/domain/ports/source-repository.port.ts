/** Parámetros para clonar la rama base de un repositorio. */
export interface CloneRequest {
  directory: string;
  repositoryFullName: string;
  baseBranch: string;
}

/** Operaciones de control de versiones que necesita una ejecución. */
export interface SourceRepository {
  /** Clona solo la rama base en el directorio indicado. */
  clone(request: CloneRequest, signal: AbortSignal): Promise<void>;
  /** Crea la rama de trabajo y configura la identidad de los commits del agente. */
  prepareBranch(directory: string, branch: string, signal: AbortSignal): Promise<void>;
  /** Cuenta los commits de HEAD que no están en la rama base remota. */
  countNewCommits(directory: string, baseBranch: string, signal: AbortSignal): Promise<number>;
  /** Sube la rama de trabajo al remoto. */
  push(directory: string, branch: string, signal: AbortSignal): Promise<void>;
}
