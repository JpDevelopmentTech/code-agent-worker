import type { LogContext } from "../../domain/entities/log-context.entity";
import type { Logger } from "../../domain/ports/logger.port";
import type { TextRedactor } from "../../domain/ports/text-redactor.port";

type LogLevel = "info" | "warn" | "error";

/**
 * Logger que escribe una línea JSON por evento: `info` a stdout, `warn` y
 * `error` a stderr. Pasa cada texto por el redactor antes de serializarlo para
 * que ningún secreto acabe en los logs del contenedor.
 */
export class JsonLogger implements Logger {
  /** Recibe el redactor que limpia cada línea antes de escribirla. */
  constructor(private readonly redactor: TextRedactor) {}

  /** Registra un evento normal del ciclo de trabajo. */
  info(message: string, context?: LogContext): void {
    this.write("info", message, context);
  }

  /** Registra algo anómalo que no detiene al worker. */
  warn(message: string, context?: LogContext): void {
    this.write("warn", message, context);
  }

  /** Registra un fallo. */
  error(message: string, context?: LogContext): void {
    this.write("error", message, context);
  }

  /** Redacta, serializa y escribe la línea en el flujo que toca. */
  private write(level: LogLevel, message: string, context?: LogContext): void {
    const entry = {
      level,
      time: new Date().toISOString(),
      message: this.redactor.redact(message),
      ...this.redactContext(context),
    };
    const stream = level === "info" ? process.stdout : process.stderr;
    stream.write(`${JSON.stringify(entry)}\n`);
  }

  /** Devuelve una copia del contexto con los valores de texto redactados. */
  private redactContext(context: LogContext | undefined): LogContext {
    const result: LogContext = {};
    for (const [key, value] of Object.entries(context ?? {})) {
      result[key] = typeof value === "string" ? this.redactor.redact(value) : value;
    }
    return result;
  }
}
