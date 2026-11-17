/** Tarea de JOLUP que el agente debe implementar. */
export interface RunTask {
  id: string;
  title: string;
  description: string | null;
}

/** Repositorio de GitHub sobre el que trabaja la ejecución. */
export interface RunRepository {
  /** Id del repositorio en JOLUP; falta si el backend es anterior a varios repos. */
  id?: string;
  /** Nombre completo en GitHub, con la forma `owner/repo`. */
  fullName: string;
  /** Rama desde la que se parte y contra la que se abre el PR. */
  baseBranch: string;
}

/** Ejecución tomada de la cola del backend: una tarea sobre uno o varios repositorios. */
export interface CodeAgentRun {
  id: string;
  /** Rama nueva donde el agente deja sus commits. */
  branch: string;
  attempts: number;
  task: RunTask;
  /** Repositorio principal; es siempre el primero de `repositories`. */
  repository: RunRepository;
  /** Todos los repositorios de la tarea, en orden y con el principal primero. */
  repositories: RunRepository[];
}
