/** Ejecutable de Claude Code. */
export const CLAUDE_BINARY = "claude";

/**
 * Argumentos fijos: modo headless, sin pedir permisos y salida en streaming.
 * `stream-json` (que exige `--verbose`) escribe un evento JSON por línea con
 * todo lo que hizo Claude: es la transcripción. La última línea es el resultado.
 */
export const CLAUDE_BASE_ARGS: readonly string[] = [
  "-p",
  "--output-format",
  "stream-json",
  "--verbose",
  "--dangerously-skip-permissions",
];

/**
 * Bytes de stdout que se conservan de Claude. La transcripción de una sesión
 * larga pesa varios MB; si se pasa, se pierde el principio y nunca el resultado.
 */
export const CLAUDE_MAX_OUTPUT_BYTES = 40 * 1024 * 1024;

/** Bandera para elegir el modelo. */
export const CLAUDE_MODEL_FLAG = "--model";

/** Bandera para limitar los turnos del agente. */
export const CLAUDE_MAX_TURNS_FLAG = "--max-turns";
