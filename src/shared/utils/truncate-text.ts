const ELLIPSIS = "…";

/**
 * Recorta un texto a un máximo de caracteres, terminando en «…» si se cortó.
 * Sirve para respetar los topes de longitud que impone el backend.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - ELLIPSIS.length)) + ELLIPSIS;
}
