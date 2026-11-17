import type { RunRepository } from "../entities/code-agent-run.entity";
import { CHECKOUT_OWNER_SEPARATOR } from "../../shared/constants/workspace.constants";

/** Separa `owner/repo` en sus dos partes. */
function splitFullName(fullName: string): { owner: string; name: string } {
  const [owner = "", name = ""] = fullName.split("/");
  return { owner, name };
}

/**
 * Elige la subcarpeta de cada clon: el nombre del repositorio, o `owner__repo`
 * si otro repositorio de la ejecución se llama igual (sin distinguir mayúsculas).
 * Devuelve los nombres en el mismo orden que los repositorios.
 */
export function assignCheckoutFolders(repositories: readonly RunRepository[]): string[] {
  const names = repositories.map((repository) => splitFullName(repository.fullName));
  const countByName = new Map<string, number>();
  for (const { name } of names) {
    const key = name.toLowerCase();
    countByName.set(key, (countByName.get(key) ?? 0) + 1);
  }
  return names.map(({ owner, name }) =>
    (countByName.get(name.toLowerCase()) ?? 0) > 1 ? `${owner}${CHECKOUT_OWNER_SEPARATOR}${name}` : name,
  );
}
