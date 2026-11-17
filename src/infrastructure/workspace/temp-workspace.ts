import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import type { Workspace } from "../../domain/ports/workspace.port";
import { RUN_DIRECTORY_PREFIX } from "../../shared/constants/workspace.constants";

/** Directorios temporales bajo `WORK_DIR`, uno por ejecución. */
export class TempWorkspace implements Workspace {
  /** Recibe la carpeta raíz donde se crean los directorios de trabajo. */
  constructor(private readonly rootDirectory: string) {}

  /** Crea un directorio único (`run-XXXXXX`) y devuelve su ruta. */
  async create(): Promise<string> {
    await mkdir(this.rootDirectory, { recursive: true });
    return mkdtemp(join(this.rootDirectory, RUN_DIRECTORY_PREFIX));
  }

  /** Borra el directorio con todo su contenido; no falla si ya no existe. */
  async remove(directory: string): Promise<void> {
    await rm(directory, { recursive: true, force: true });
  }
}
