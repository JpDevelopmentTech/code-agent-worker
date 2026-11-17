import { z } from "zod";

/** Nombre de rama seguro: sin espacios ni guion inicial (no puede pasar por opción de git). */
const branchName = z
  .string()
  .min(1)
  .regex(/^(?!-)[A-Za-z0-9._/-]+$/, "Nombre de rama no válido.");

/** Respuesta 200 de `POST /claim`: la ejecución que pasa a ser de este worker. */
export const claimResponseSchema = z.object({
  run: z.object({
    id: z.guid(),
    branch: branchName,
    attempts: z.number().int().nonnegative(),
    task: z.object({
      id: z.guid(),
      title: z.string().min(1),
      description: z.string().nullable(),
    }),
    repository: z.object({
      fullName: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Repositorio no válido."),
      baseBranch: branchName,
    }),
  }),
});
