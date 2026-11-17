/**
 * Interpreta un texto como JSON; devuelve `undefined` si no lo es.
 * Solo se traga `SyntaxError`, que es el caso esperado; cualquier otro error se propaga.
 */
export function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) return undefined;
    throw error;
  }
}
