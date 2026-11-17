import type { TextRedactor } from "../domain/ports/text-redactor.port";

/** Secreto de ejemplo que el redactor de los tests sabe ocultar. */
export const FAKE_SECRET = "ghp_secreto_de_prueba_123";

/** Redactor de tests: oculta solo `FAKE_SECRET`. */
export class FakeRedactor implements TextRedactor {
  /** Sustituye el secreto de ejemplo por una marca. */
  redact(text: string): string {
    return text.split(FAKE_SECRET).join("[REDACTADO]");
  }
}
