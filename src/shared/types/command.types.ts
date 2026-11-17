/** Proceso hijo que se quiere ejecutar. */
export interface CommandRequest {
  command: string;
  args: readonly string[];
  /** Directorio de trabajo; por defecto el del worker. */
  cwd?: string;
  /** Entorno completo del hijo: no se hereda nada del worker. */
  env: Readonly<Record<string, string>>;
  /** Texto que se escribe en la entrada estándar del hijo. */
  stdin?: string;
  timeoutMs: number;
  signal: AbortSignal;
  /** Tope de bytes de stdout que se conservan; por defecto el general. */
  maxStdoutBytes?: number;
}

/** Cómo terminó un proceso hijo. Nunca se lanza: el llamador interpreta el resultado. */
export interface CommandResult {
  /** Código de salida; `null` si murió por una señal o no llegó a arrancar. */
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  aborted: boolean;
  /** Error al arrancar el proceso (por ejemplo, el ejecutable no existe). */
  spawnError?: string;
}
