import {
  CLAUDE_APPEND_SYSTEM_PROMPT_FLAG,
  CLAUDE_BASE_ARGS,
  CLAUDE_EFFORT_FLAG,
  type CLAUDE_EFFORT_LEVELS,
  CLAUDE_MAX_TURNS_FLAG,
  CLAUDE_MODEL_FLAG,
} from "../../shared/constants/claude.constants";

/** Opciones de la CLI que dependen de la configuración. */
export interface ClaudeCliOptions {
  model?: string;
  effort?: (typeof CLAUDE_EFFORT_LEVELS)[number];
  /** Reglas del agente que se añaden al final del system prompt. */
  appendSystemPrompt?: string;
  maxTurns?: number;
}

/**
 * Arma los argumentos de `claude`: modo headless con salida JSON y sin pedir
 * permisos, más el modelo, el esfuerzo, las reglas del agente y el tope de
 * turnos si están configurados.
 * El prompt no va aquí: se pasa por stdin para que no aparezca en `ps`.
 */
export function buildClaudeArgs(options: ClaudeCliOptions): string[] {
  const args = [...CLAUDE_BASE_ARGS];
  if (options.model !== undefined) args.push(CLAUDE_MODEL_FLAG, options.model);
  if (options.effort !== undefined) args.push(CLAUDE_EFFORT_FLAG, options.effort);
  if (options.appendSystemPrompt !== undefined) {
    args.push(CLAUDE_APPEND_SYSTEM_PROMPT_FLAG, options.appendSystemPrompt);
  }
  if (options.maxTurns !== undefined) args.push(CLAUDE_MAX_TURNS_FLAG, String(options.maxTurns));
  return args;
}
