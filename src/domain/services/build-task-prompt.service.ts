import type { RunTask } from "../entities/code-agent-run.entity";
import {
  PROMPT_DELIMITER_PATTERN,
  PROMPT_DESCRIPTION_PLACEHOLDER,
  PROMPT_EMPTY_DESCRIPTION,
  PROMPT_TITLE_PLACEHOLDER,
  TASK_PROMPT_TEMPLATE,
} from "../../shared/constants/prompt.constants";

/**
 * Quita de un dato de la tarea cualquier etiqueta de delimitación.
 * Así un título o una descripción no pueden "cerrar" su bloque y colar
 * texto que parezca parte de las reglas del prompt.
 */
function neutralizeDelimiters(text: string): string {
  return text.replace(PROMPT_DELIMITER_PATTERN, "").trim();
}

/**
 * Construye el prompt que recibe Claude Code a partir de la plantilla fija
 * y de los datos de la tarea, que quedan delimitados como datos y no como órdenes.
 */
export function buildTaskPrompt(task: RunTask): string {
  const title = neutralizeDelimiters(task.title);
  const description = neutralizeDelimiters(task.description ?? "");
  return TASK_PROMPT_TEMPLATE.replace(PROMPT_TITLE_PLACEHOLDER, () => title).replace(
    PROMPT_DESCRIPTION_PLACEHOLDER,
    () => (description === "" ? PROMPT_EMPTY_DESCRIPTION : description),
  );
}
