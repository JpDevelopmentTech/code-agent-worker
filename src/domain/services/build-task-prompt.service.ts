import type { RunTask } from "../entities/code-agent-run.entity";
import { TASK_PROMPT_TEMPLATE } from "../../shared/constants/prompt.constants";
import { fillTaskPlaceholders } from "./fill-task-placeholders.service";

/**
 * Construye el prompt que recibe Claude Code cuando la tarea es de un solo
 * repositorio, a partir de la plantilla fija y de los datos de la tarea.
 */
export function buildTaskPrompt(task: RunTask): string {
  return fillTaskPlaceholders(TASK_PROMPT_TEMPLATE, task);
}
