import type { RunRepository } from "./code-agent-run.entity";

/** Clon de un repositorio de la ejecución dentro del directorio temporal. */
export interface RepositoryCheckout {
  repository: RunRepository;
  /** Nombre de la subcarpeta del clon (`repo` u `owner__repo`). */
  folder: string;
  /** Ruta absoluta del clon. */
  directory: string;
}
