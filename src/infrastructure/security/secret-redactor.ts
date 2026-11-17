import type { TextRedactor } from "../../domain/ports/text-redactor.port";
import { redactSecrets } from "../../shared/utils/redact-secrets";

/**
 * Redactor que conoce los secretos del worker (token de GitHub, token del
 * backend, token de Claude y la cabecera básica derivada del de GitHub).
 */
export class SecretRedactor implements TextRedactor {
  private readonly secrets: readonly string[];

  /** Recibe la lista de secretos que nunca deben salir en logs ni mensajes. */
  constructor(secrets: readonly string[]) {
    this.secrets = [...secrets];
  }

  /** Sustituye cada secreto conocido del texto por la marca de redacción. */
  redact(text: string): string {
    return redactSecrets(text, this.secrets);
  }
}
