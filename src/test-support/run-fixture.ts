import type { CodeAgentRun } from "../domain/entities/code-agent-run.entity";

/** Ejecución de ejemplo para los tests; se puede sobrescribir cualquier campo. */
export function buildRun(overrides: Partial<CodeAgentRun> = {}): CodeAgentRun {
  return {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    branch: "jolup/tarea-123",
    attempts: 1,
    task: {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Añadir validación al formulario",
      description: "El campo email debe ser obligatorio.",
    },
    repository: { fullName: "jpdev/demo", baseBranch: "main" },
    ...overrides,
  };
}
