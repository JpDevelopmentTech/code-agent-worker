import { parseJsonOrUndefined } from "../../shared/utils/parse-json-or-undefined";
import { githubErrorSchema } from "./github-pull-request.schema";

/**
 * Convierte una respuesta de error de GitHub en un mensaje legible:
 * el código HTTP, el `message` general y los detalles de `errors` si los hay
 * (por ejemplo, «A pull request already exists»).
 */
export function describeGithubError(status: number, bodyText: string): string {
  const parsed = githubErrorSchema.safeParse(parseJsonOrUndefined(bodyText));
  if (!parsed.success) return `GitHub rechazó el Pull Request (HTTP ${status}).`;
  const details = (parsed.data.errors ?? [])
    .map((item) => item.message)
    .filter((message): message is string => message !== undefined && message !== "");
  const parts = [parsed.data.message, ...details].filter((part) => part !== undefined);
  const reason = parts.length === 0 ? "" : `: ${parts.join(" · ")}`;
  return `GitHub rechazó el Pull Request (HTTP ${status})${reason}`;
}
