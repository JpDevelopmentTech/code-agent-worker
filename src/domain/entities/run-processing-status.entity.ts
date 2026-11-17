/**
 * Cómo terminó un intento de procesar la cola:
 * - `idle`: no había trabajo.
 * - `done` / `failed`: se procesó una ejecución y se informó al backend.
 * - `aborted`: se cortó (heartbeat perdido o apagado) y no se informó.
 */
export type RunProcessingStatus = "idle" | "done" | "failed" | "aborted";
