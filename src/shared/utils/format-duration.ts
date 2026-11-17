const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/**
 * Expresa una duración en milisegundos como texto corto en español
 * («45 min» o «30 s»), para los mensajes de fallo por tiempo.
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.round(milliseconds / MS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} s`;
  return `${Math.round(seconds / SECONDS_PER_MINUTE)} min`;
}
