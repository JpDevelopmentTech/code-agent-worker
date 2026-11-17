/** Tarea de JOLUP que el agente debe implementar. */
export interface RunTask {
  id: string;
  title: string;
  description: string | null;
}

/** Repositorio de GitHub sobre el que trabaja la ejecución. */
export interface RunRepository {
  /** Nombre completo en GitHub, con la forma `owner/repo`. */
  fullName: string;
  /** Rama desde la que se parte y contra la que se abre el PR. */
  baseBranch: string;
}

/** Ejecución tomada de la cola del backend: una tarea sobre un repositorio. */
export interface CodeAgentRun {
  id: string;
  /** Rama nueva donde el agente deja sus commits. */
  branch: string;
  attempts: number;
  task: RunTask;
  repository: RunRepository;
}
