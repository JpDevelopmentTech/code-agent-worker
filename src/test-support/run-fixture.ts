import type { CodeAgentRun, RunRepository } from "../domain/entities/code-agent-run.entity";

/** Id en JOLUP del repositorio principal de ejemplo. */
export const MAIN_REPOSITORY_ID = "9b2f4a1e-1c3d-4e5f-8a9b-0c1d2e3f4a5b";

/** Segundo repositorio de ejemplo, para las ejecuciones de varios repos. */
export const SECOND_REPOSITORY: RunRepository = {
  id: "5d6e7f80-91a2-4b3c-8d4e-5f6a7b8c9d0e",
  fullName: "jpdev/web",
  baseBranch: "develop",
};

/** Ejecución de ejemplo para los tests; se puede sobrescribir cualquier campo. */
export function buildRun(overrides: Partial<CodeAgentRun> = {}): CodeAgentRun {
  const repository = { fullName: "jpdev/demo", baseBranch: "main" };
  return {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    branch: "jolup/tarea-123",
    attempts: 1,
    task: {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Añadir validación al formulario",
      description: "El campo email debe ser obligatorio.",
    },
    repository,
    repositories: [{ id: MAIN_REPOSITORY_ID, ...repository }],
    ...overrides,
  };
}

/** Ejecución de ejemplo sobre dos repositorios: `jpdev/demo` (principal) y `jpdev/web`. */
export function buildMultiRepoRun(): CodeAgentRun {
  const run = buildRun();
  return { ...run, repositories: [...run.repositories, SECOND_REPOSITORY] };
}
