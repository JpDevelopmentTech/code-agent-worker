import type { LogContext } from "../entities/log-context.entity";

/** Registro estructurado de lo que hace el worker. */
export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}
