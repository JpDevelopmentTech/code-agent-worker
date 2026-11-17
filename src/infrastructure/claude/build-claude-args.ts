import {
  CLAUDE_BASE_ARGS,
  CLAUDE_MAX_TURNS_FLAG,
  CLAUDE_MODEL_FLAG,
} from "../../shared/constants/claude.constants";

/** Opciones de la CLI que dependen de la configuración. */
export interface ClaudeCliOptions {
  model?: string;
  maxTurns?: number;
}

/**
 * Arma los argumentos de `claude`: modo headless con salida JSON y sin pedir
 * permisos, más el modelo y el tope de turnos si están configurados.
 * El prompt no va aquí: se pasa por stdin para que no aparezca en `ps`.
 */
export function buildClaudeArgs(options: ClaudeCliOptions): string[] {
  const args = [...CLAUDE_BASE_ARGS];
  if (options.model !== undefined) args.push(CLAUDE_MODEL_FLAG, options.model);
  if (options.maxTurns !== undefined) args.push(CLAUDE_MAX_TURNS_FLAG, String(options.maxTurns));
  return args;
}
