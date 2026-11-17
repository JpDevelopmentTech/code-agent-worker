/**
 * Fallo esperado en un paso de la ejecución (clonar, Claude, push, PR...).
 * Su mensaje ya está en español y listo para mostrarse al usuario.
 */
export class RunStepError extends Error {
  /** Crea el error con un mensaje legible para el usuario final. */
  constructor(message: string) {
    super(message);
    this.name = "RunStepError";
  }
}
