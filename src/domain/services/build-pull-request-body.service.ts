import {
  PR_REVIEW_NOTE,
  PR_TASK_LINE_PREFIX,
} from "../../shared/constants/pull-request.constants";

/**
 * Arma la descripción del PR: el resumen del agente, el enlace a la tarea
 * de JOLUP y la nota que recuerda revisarlo antes de fusionar.
 */
export function buildPullRequestBody(summary: string, taskId: string): string {
  return [summary.trim(), "---", `${PR_TASK_LINE_PREFIX}${taskId}`, PR_REVIEW_NOTE].join("\n\n");
}
