import type { LogContext } from "../domain/entities/log-context.entity";
import type { Logger } from "../domain/ports/logger.port";

/** Logger que guarda las entradas en memoria para poder inspeccionarlas. */
export class FakeLogger implements Logger {
  readonly entries: Array<{ level: string; message: string; context?: LogContext }> = [];

  /** Guarda una entrada informativa. */
  info(message: string, context?: LogContext): void {
    this.entries.push({ level: "info", message, context });
  }

  /** Guarda un aviso. */
  warn(message: string, context?: LogContext): void {
    this.entries.push({ level: "warn", message, context });
  }

  /** Guarda un error. */
  error(message: string, context?: LogContext): void {
    this.entries.push({ level: "error", message, context });
  }
}
