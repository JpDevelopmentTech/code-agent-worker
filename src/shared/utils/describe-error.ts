/**
 * Convierte cualquier valor lanzado en un texto legible.
 * Hace falta porque en TypeScript un `catch` recibe `unknown`.
 */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}
