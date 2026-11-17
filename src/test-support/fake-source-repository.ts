import type { CloneRequest, SourceRepository } from "../domain/ports/source-repository.port";

/** Repositorio en memoria: registra las operaciones y simula los commits nuevos. */
export class FakeSourceRepository implements SourceRepository {
  readonly calls: string[] = [];
  newCommits = 1;
  cloneError: Error | undefined;

  /** Registra el clon o lanza el error configurado. */
  async clone(request: CloneRequest): Promise<void> {
    this.calls.push(`clone ${request.repositoryFullName}@${request.baseBranch}`);
    if (this.cloneError !== undefined) throw this.cloneError;
  }

  /** Registra la creación de la rama. */
  async prepareBranch(_directory: string, branch: string): Promise<void> {
    this.calls.push(`branch ${branch}`);
  }

  /** Devuelve el número de commits configurado. */
  async countNewCommits(): Promise<number> {
    this.calls.push("count");
    return this.newCommits;
  }

  /** Registra el push. */
  async push(_directory: string, branch: string): Promise<void> {
    this.calls.push(`push ${branch}`);
  }
}
