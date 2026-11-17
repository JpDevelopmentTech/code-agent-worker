/** Ejecutable de Claude Code. */
export const CLAUDE_BINARY = "claude";

/** Argumentos fijos: modo headless, salida JSON y sin pedir permisos. */
export const CLAUDE_BASE_ARGS: readonly string[] = [
  "-p",
  "--output-format",
  "json",
  "--dangerously-skip-permissions",
];

/** Bandera para elegir el modelo. */
export const CLAUDE_MODEL_FLAG = "--model";

/** Bandera para limitar los turnos del agente. */
export const CLAUDE_MAX_TURNS_FLAG = "--max-turns";
