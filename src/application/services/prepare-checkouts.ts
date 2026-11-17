import { join } from "node:path";
import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { RepositoryCheckout } from "../../domain/entities/repository-checkout.entity";
import type { SourceRepository } from "../../domain/ports/source-repository.port";
import { assignCheckoutFolders } from "../../domain/services/assign-checkout-folders.service";

/**
 * Clona cada repositorio de la ejecución en su propia subcarpeta del directorio
 * temporal y crea en cada clon la rama de trabajo. Va en orden y se detiene en
 * el primer fallo: sin todos los clones no tiene sentido lanzar al agente.
 */
export async function prepareCheckouts(
  sourceRepository: SourceRepository,
  run: CodeAgentRun,
  parentDirectory: string,
  signal: AbortSignal,
): Promise<RepositoryCheckout[]> {
  const folders = assignCheckoutFolders(run.repositories);
  const checkouts = run.repositories.map((repository, index) => {
    const folder = folders[index] ?? repository.fullName;
    return { repository, folder, directory: join(parentDirectory, folder) };
  });
  for (const { repository, directory } of checkouts) {
    const { fullName, baseBranch } = repository;
    await sourceRepository.clone({ directory, repositoryFullName: fullName, baseBranch }, signal);
    await sourceRepository.prepareBranch(directory, run.branch, signal);
  }
  return checkouts;
}
