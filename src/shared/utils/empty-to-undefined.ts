/**
 * Trata una cadena vacía (o solo espacios) como ausente.
 * Los paneles de despliegue suelen dejar variables definidas pero vacías.
 */
export function emptyToUndefined(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}
