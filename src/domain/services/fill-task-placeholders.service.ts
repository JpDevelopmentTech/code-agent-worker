import type { RunTask } from "../entities/code-agent-run.entity";
import {
  PROMPT_DELIMITER_PATTERN,
  PROMPT_DESCRIPTION_PLACEHOLDER,
  PROMPT_EMPTY_DESCRIPTION,
  PROMPT_TASK_PLACEHOLDER_PATTERN,
  PROMPT_TITLE_PLACEHOLDER,
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
 * Sustituye en una plantilla el título y la descripción de la tarea, que quedan
 * delimitados como datos y no como órdenes. Lo hace en una sola pasada para que
 * una marca escrita dentro del título no se trague la descripción.
 */
export function fillTaskPlaceholders(template: string, task: RunTask): string {
  const description = neutralizeDelimiters(task.description ?? "");
  const values: Record<string, string> = {
    [PROMPT_TITLE_PLACEHOLDER]: neutralizeDelimiters(task.title),
    [PROMPT_DESCRIPTION_PLACEHOLDER]: description === "" ? PROMPT_EMPTY_DESCRIPTION : description,
  };
  return template.replace(PROMPT_TASK_PLACEHOLDER_PATTERN, (placeholder) => values[placeholder] ?? placeholder);
}
