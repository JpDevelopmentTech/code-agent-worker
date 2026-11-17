import type { CloneRequest, SourceRepository } from "../domain/ports/source-repository.port";

/** Última parte de una ruta: la subcarpeta del clon. */
function folderOf(directory: string): string {
  return directory.split("/").pop() ?? directory;
}

/** Repositorio en memoria: registra las operaciones y simula los commits nuevos. */
export class FakeSourceRepository implements SourceRepository {
  readonly calls: string[] = [];
  /** Directorios donde se clonó, en orden. */
  readonly clonedDirectories: string[] = [];
  /** Subcarpetas cuya rama se subió, en orden. */
  readonly pushedFolders: string[] = [];
  /** Commits nuevos por subcarpeta; si falta, vale `newCommits`. */
  readonly commitsByFolder: Record<string, number> = {};
  /** Error del push por subcarpeta. */
  readonly pushErrors: Record<string, Error> = {};
  newCommits = 1;
  cloneError: Error | undefined;

  /** Registra el clon o lanza el error configurado. */
  async clone(request: CloneRequest): Promise<void> {
    this.calls.push(`clone ${request.repositoryFullName}@${request.baseBranch}`);
    this.clonedDirectories.push(request.directory);
    if (this.cloneError !== undefined) throw this.cloneError;
  }

  /** Registra la creación de la rama. */
  async prepareBranch(_directory: string, branch: string): Promise<void> {
    this.calls.push(`branch ${branch}`);
  }

  /** Devuelve el número de commits configurado para esa subcarpeta. */
  async countNewCommits(directory: string): Promise<number> {
    this.calls.push("count");
    return this.commitsByFolder[folderOf(directory)] ?? this.newCommits;
  }

  /** Registra el push o lanza el error configurado para esa subcarpeta. */
  async push(directory: string, branch: string): Promise<void> {
    this.calls.push(`push ${branch}`);
    const error = this.pushErrors[folderOf(directory)];
    if (error !== undefined) throw error;
    this.pushedFolders.push(folderOf(directory));
  }
}
