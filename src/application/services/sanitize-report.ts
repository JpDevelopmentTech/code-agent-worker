import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import type { TextRedactor } from "../../domain/ports/text-redactor.port";
import { MAX_ERROR_LENGTH, MAX_SUMMARY_LENGTH } from "../../shared/constants/run.constants";
import { truncateText } from "../../shared/utils/truncate-text";

/**
 * Prepara un informe para salir hacia el backend: quita secretos de los textos
 * y los recorta a los topes del contrato (4000 el resumen, 1000 el error).
 */
export function sanitizeReport(report: RunFinishReport, redactor: TextRedactor): RunFinishReport {
  const clean = (text: string, max: number): string => truncateText(redactor.redact(text), max);
  if (report.outcome === "done") {
    return { ...report, summary: clean(report.summary, MAX_SUMMARY_LENGTH) };
  }
  const summary =
    report.summary === undefined ? undefined : clean(report.summary, MAX_SUMMARY_LENGTH);
  return {
    outcome: "failed",
    error: clean(report.error, MAX_ERROR_LENGTH),
    ...(summary === undefined ? {} : { summary }),
  };
}
