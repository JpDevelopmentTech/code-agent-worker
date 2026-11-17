import type { RunFailedReport } from "../../domain/entities/run-finish-report.entity";
import { RunStepError } from "../../domain/errors/run-step.error";
import { UNEXPECTED_ERROR_PREFIX } from "../../shared/constants/run.constants";
import { describeError } from "../../shared/utils/describe-error";

/**
 * Traduce un error del pipeline a un informe de fallo.
 * Los fallos de pasos conocidos ya traen un mensaje para el usuario;
 * el resto se presenta como error inesperado con su causa.
 */
export function toFailedReport(error: unknown): RunFailedReport {
  if (error instanceof RunStepError) return { outcome: "failed", error: error.message };
  return { outcome: "failed", error: `${UNEXPECTED_ERROR_PREFIX}: ${describeError(error)}` };
}
