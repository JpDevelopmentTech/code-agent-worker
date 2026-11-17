/**
 * Espera el tiempo indicado o hasta que se aborte la señal, lo que pase antes.
 * Nunca lanza: al abortar simplemente resuelve, para que el bucle pueda salir.
 */
export function interruptibleSleep(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const onAbort = (): void => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
