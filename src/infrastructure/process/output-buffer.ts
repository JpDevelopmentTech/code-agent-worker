/**
 * Acumula la salida de un proceso con un tope de bytes. Si se pasa, descarta
 * lo más antiguo: el final de la salida es lo que interesa (JSON y errores).
 */
export class OutputBuffer {
  private readonly chunks: Buffer[] = [];
  private size = 0;

  /** Fija el máximo de bytes que se conservan. */
  constructor(private readonly maxBytes: number) {}

  /** Añade un trozo de salida y recorta por el principio si hace falta. */
  append(chunk: Buffer): void {
    this.chunks.push(chunk);
    this.size += chunk.length;
    while (this.size > this.maxBytes && this.chunks.length > 1) {
      const dropped = this.chunks.shift();
      this.size -= dropped === undefined ? 0 : dropped.length;
    }
  }

  /** Devuelve la salida acumulada como texto UTF-8. */
  toString(): string {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}
