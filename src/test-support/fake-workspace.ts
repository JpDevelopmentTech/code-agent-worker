import type { Workspace } from "../domain/ports/workspace.port";

/** Espacio de trabajo en memoria que registra qué directorios se crean y borran. */
export class FakeWorkspace implements Workspace {
  readonly created: string[] = [];
  readonly removed: string[] = [];

  /** Simula la creación de un directorio con un nombre predecible. */
  async create(): Promise<string> {
    const directory = `/tmp/fake/run-${this.created.length + 1}`;
    this.created.push(directory);
    return directory;
  }

  /** Registra el borrado. */
  async remove(directory: string): Promise<void> {
    this.removed.push(directory);
  }
}
