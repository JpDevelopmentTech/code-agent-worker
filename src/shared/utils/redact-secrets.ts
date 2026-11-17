import { MIN_SECRET_LENGTH, REDACTED_MARK } from "../constants/redaction.constants";

/**
 * Sustituye cada aparición de los secretos indicados por una marca fija.
 * Ignora valores vacíos o demasiado cortos para no destrozar textos normales,
 * y empieza por los más largos para que un secreto contenido en otro no deje restos.
 */
export function redactSecrets(text: string, secrets: readonly string[]): string {
  const candidates = secrets
    .filter((secret) => secret.length >= MIN_SECRET_LENGTH)
    .sort((a, b) => b.length - a.length);
  return candidates.reduce((result, secret) => result.split(secret).join(REDACTED_MARK), text);
}
