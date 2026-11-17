/** Espera entre SIGTERM y SIGKILL al cortar un proceso hijo. */
export const KILL_GRACE_PERIOD_MS = 10_000;

/** Tiempo máximo de cada comando de git (clone y push incluidos). */
export const GIT_COMMAND_TIMEOUT_MS = 600_000;

/** Caracteres del final de stderr que se incluyen en un mensaje de error. */
export const STDERR_TAIL_LENGTH = 600;

/** Bytes máximos de salida que se guardan de un proceso hijo. */
export const MAX_CAPTURED_OUTPUT_BYTES = 5 * 1024 * 1024;

/** Idioma por defecto de los procesos hijos si el contenedor no define LANG. */
export const DEFAULT_CHILD_LANG = "C.UTF-8";
