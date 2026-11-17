import type { RunMetrics } from "./run-finish-report.entity";

/**
 * Lo que deja una ejecución aparte de su desenlace: la transcripción de la
 * sesión y lo que costó. El pipeline lo va llenando y el caso de uso lo envía
 * al backend aunque un paso posterior falle.
 */
export interface RunArtifacts extends RunMetrics {
  transcript?: string;
}
