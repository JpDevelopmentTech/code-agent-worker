import { z } from "zod";

/** Respuesta de GitHub al crear un PR: su URL pública y su número para editarlo. */
export const githubPullRequestSchema = z.looseObject({
  html_url: z.url(),
  number: z.number().int().positive(),
});

/** Cuerpo de error de la API de GitHub (`message` y, a veces, `errors`). */
export const githubErrorSchema = z.looseObject({
  message: z.string().optional(),
  errors: z.array(z.looseObject({ message: z.string().optional() })).optional(),
});
