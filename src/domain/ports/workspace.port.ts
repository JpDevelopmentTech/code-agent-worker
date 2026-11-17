/** Directorios temporales donde se clona cada repositorio. */
export interface Workspace {
  /** Crea un directorio vacío y devuelve su ruta absoluta. */
  create(): Promise<string>;
  /** Borra el directorio y todo su contenido; no falla si ya no existe. */
  remove(directory: string): Promise<void>;
}
