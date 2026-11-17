/**
 * Devuelve los últimos caracteres de un texto, sin espacios sobrantes.
 * Útil para mostrar el final de stderr, que es donde suele estar la causa del fallo.
 */
export function tailText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `…${trimmed.slice(trimmed.length - maxLength)}`;
}
