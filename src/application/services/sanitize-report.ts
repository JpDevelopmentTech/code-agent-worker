import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import type { TextRedactor } from "../../domain/ports/text-redactor.port";
import { MAX_ERROR_LENGTH, MAX_SUMMARY_LENGTH } from "../../shared/constants/run.constants";
import { truncateText } from "../../shared/utils/truncate-text";
import { sanitizeRepositoryOutcomes } from "./sanitize-repository-outcomes";

/**
 * Prepara un informe para salir hacia el backend: quita secretos de los textos
 * y los recorta a los topes del contrato (4000 el resumen, 1000 el error y 500
 * el error de cada repositorio).
 */
export function sanitizeReport(report: RunFinishReport, redactor: TextRedactor): RunFinishReport {
  const clean = (text: string, max: number): string => truncateText(redactor.redact(text), max);
  const repositories =
    report.repositories === undefined
      ? {}
      : { repositories: sanitizeRepositoryOutcomes(report.repositories, redactor) };
  if (report.outcome === "done") {
    return { ...report, summary: clean(report.summary, MAX_SUMMARY_LENGTH), ...repositories };
  }
  const summary =
    report.summary === undefined ? undefined : clean(report.summary, MAX_SUMMARY_LENGTH);
  return {
    ...report,
    error: clean(report.error, MAX_ERROR_LENGTH),
    ...(summary === undefined ? {} : { summary }),
    ...repositories,
  };
}
