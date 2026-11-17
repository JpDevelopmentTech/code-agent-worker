/** Elimina secretos de un texto antes de registrarlo o enviarlo fuera. */
export interface TextRedactor {
  /** Devuelve el texto con cada secreto conocido sustituido por una marca. */
  redact(text: string): string;
}
