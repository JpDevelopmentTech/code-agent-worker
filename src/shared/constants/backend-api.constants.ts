/** Prefijo de la API interna del backend para el worker. */
export const CODE_AGENT_API_PREFIX = "/internal/code-agent";

/** Ruta para tomar la siguiente ejecución. */
export const CLAIM_PATH = "/claim";

/** Prefijo de las rutas de una ejecución concreta (`/runs/:id/...`). */
export const RUNS_PATH = "/runs";

/** Sufijos de las rutas de una ejecución. */
export const HEARTBEAT_SUFFIX = "/heartbeat";
export const FINISH_SUFFIX = "/finish";
export const TRANSCRIPT_SUFFIX = "/transcript";

/** La transcripción viaja comprimida: un JSONL de varios MB queda en unos cientos de KB. */
export const TRANSCRIPT_CONTENT_TYPE = "application/gzip";

/** Tiempo máximo de cada llamada al backend. */
export const BACKEND_REQUEST_TIMEOUT_MS = 30_000;

/** Códigos HTTP con significado propio en el contrato. */
export const HTTP_OK = 200;
export const HTTP_NO_CONTENT = 204;
export const HTTP_CONFLICT = 409;

/** Caracteres del cuerpo de una respuesta inesperada que se incluyen en el error. */
export const MAX_ERROR_BODY_LENGTH = 300;
