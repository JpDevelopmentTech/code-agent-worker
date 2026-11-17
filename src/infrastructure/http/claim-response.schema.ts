import { z } from "zod";
import { MAX_RUN_REPOSITORIES } from "../../shared/constants/run.constants";

/** Nombre de rama seguro: sin espacios ni guion inicial (no puede pasar por opción de git). */
const branchName = z
  .string()
  .min(1)
  .regex(/^(?!-)[A-Za-z0-9._/-]+$/, "Nombre de rama no válido.");

/**
 * `owner/repo` de GitHub. El nombre no puede ser `.` ni `..` porque se usa como
 * subcarpeta del clon dentro del directorio temporal.
 */
const repositoryFullName = z
  .string()
  .regex(/^[A-Za-z0-9_.-]+\/(?!\.\.?$)[A-Za-z0-9_.-]+$/, "Repositorio no válido.");

/** Repositorio principal, tal como venía antes de admitir varios. */
const repository = z.object({ fullName: repositoryFullName, baseBranch: branchName });

/** Ejecución tal como llega; `repositories` falta si el backend es anterior a varios repos. */
const claimedRun = z.object({
  id: z.guid(),
  branch: branchName,
  attempts: z.number().int().nonnegative(),
  task: z.object({
    id: z.guid(),
    title: z.string().min(1),
    description: z.string().nullable(),
  }),
  repository,
  repositories: z
    .array(repository.extend({ id: z.guid() }))
    .min(1)
    .max(MAX_RUN_REPOSITORIES)
    .optional(),
});

/**
 * Respuesta 200 de `POST /claim`: la ejecución que pasa a ser de este worker.
 * Sin `repositories` (backend viejo) se trabaja solo con `repository`, sin id.
 */
export const claimResponseSchema = z.object({
  run: claimedRun.transform(({ repositories, ...run }) => ({
    ...run,
    repositories: repositories ?? [run.repository],
  })),
});
