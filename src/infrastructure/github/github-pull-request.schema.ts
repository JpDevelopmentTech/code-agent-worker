import { z } from "zod";

/** Respuesta de GitHub al crear un PR: solo interesa su URL pública. */
export const githubPullRequestSchema = z.looseObject({
  html_url: z.url(),
});

/** Cuerpo de error de la API de GitHub (`message` y, a veces, `errors`). */
export const githubErrorSchema = z.looseObject({
  message: z.string().optional(),
  errors: z.array(z.looseObject({ message: z.string().optional() })).optional(),
});
