/**
 * Fallo al hablar con el backend de JOLUP (red caída o respuesta inesperada).
 * El bucle lo trata como "backend no disponible": espera y vuelve a intentar.
 */
export class BackendRequestError extends Error {
  /** Crea el error con un mensaje que describe la llamada fallida. */
  constructor(message: string) {
    super(message);
    this.name = "BackendRequestError";
  }
}
