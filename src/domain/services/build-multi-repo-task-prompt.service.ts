import type { RunTask } from "../entities/code-agent-run.entity";
import type { RepositoryCheckout } from "../entities/repository-checkout.entity";
import {
  MULTI_REPO_TASK_PROMPT_TEMPLATE,
  PROMPT_REPOSITORIES_PLACEHOLDER,
} from "../../shared/constants/multi-repo-prompt.constants";
import { fillTaskPlaceholders } from "./fill-task-placeholders.service";

/** Una línea por repositorio: su carpeta, su nombre en GitHub y su rama base. */
function describeCheckouts(checkouts: readonly RepositoryCheckout[]): string {
  return checkouts
    .map(({ folder, repository }) => `- \`${folder}/\`: ${repository.fullName} (rama base: ${repository.baseBranch})`)
    .join("\n");
}

/**
 * Construye el prompt de una tarea que abarca varios repositorios: la lista de
 * clones va primero y los datos de la tarea después, para que la tarea no
 * pueda inyectar nada en la lista.
 */
export function buildMultiRepoTaskPrompt(task: RunTask, checkouts: readonly RepositoryCheckout[]): string {
  const template = MULTI_REPO_TASK_PROMPT_TEMPLATE.replace(PROMPT_REPOSITORIES_PLACEHOLDER, () =>
    describeCheckouts(checkouts),
  );
  return fillTaskPlaceholders(template, task);
}
