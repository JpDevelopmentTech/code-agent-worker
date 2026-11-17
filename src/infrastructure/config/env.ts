import { z } from "zod";
import { emptyToUndefined } from "../../shared/utils/empty-to-undefined";

/** Entero positivo leído de una variable de entorno, con valor por defecto. */
const positiveInt = (fallback: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));

/** Texto no vacío leído de una variable de entorno, con valor por defecto. */
const textWithDefault = (fallback: string) =>
  z.preprocess(emptyToUndefined, z.string().min(1).default(fallback));

/** Esquema de las variables de entorno que el worker necesita para arrancar. */
const envSchema = z.object({
  JOLUP_API_URL: z.url().transform((url) => url.replace(/\/+$/, "")),
  CODE_AGENT_WORKER_TOKEN: z.string().min(32, "CODE_AGENT_WORKER_TOKEN debe tener al menos 32 caracteres."),
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN es obligatorio."),
  CLAUDE_CODE_OAUTH_TOKEN: z.string().min(1, "CLAUDE_CODE_OAUTH_TOKEN es obligatorio."),
  POLL_INTERVAL_MS: positiveInt(30_000),
  HEARTBEAT_INTERVAL_MS: positiveInt(120_000),
  RUN_TIMEOUT_MS: positiveInt(2_700_000),
  CLAUDE_MODEL: z.preprocess(emptyToUndefined, z.string().optional()),
  CLAUDE_MAX_TURNS: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  WORK_DIR: textWithDefault("/tmp/code-agent-runs"),
  GIT_AUTHOR_NAME: textWithDefault("JOLUP Agent"),
  GIT_AUTHOR_EMAIL: z.preprocess(emptyToUndefined, z.email().default("agent@jpdev.com.co")),
});

/** Configuración del worker ya validada y con los valores por defecto aplicados. */
export type WorkerEnv = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno. Lanza un error que lista solo los nombres
 * de las variables inválidas, nunca sus valores (pueden ser secretos).
 */
export function loadEnv(source: NodeJS.ProcessEnv): WorkerEnv {
  const parsed = envSchema.safeParse(source);
  if (parsed.success) return parsed.data;
  const problems = parsed.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
  throw new Error(`Variables de entorno inválidas: ${problems.join("; ")}`);
}
