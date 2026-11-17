import type { RepositoryOutcome } from "../../domain/entities/repository-outcome.entity";
import type { TextRedactor } from "../../domain/ports/text-redactor.port";
import { MAX_REPOSITORY_ERROR_LENGTH } from "../../shared/constants/run.constants";
import { truncateText } from "../../shared/utils/truncate-text";

/** Quita secretos del error de cada repositorio y lo recorta al tope del contrato (500). */
export function sanitizeRepositoryOutcomes(
  outcomes: readonly RepositoryOutcome[],
  redactor: TextRedactor,
): RepositoryOutcome[] {
  return outcomes.map((outcome) =>
    outcome.outcome === "failed"
      ? { ...outcome, error: truncateText(redactor.redact(outcome.error), MAX_REPOSITORY_ERROR_LENGTH) }
      : outcome,
  );
}
