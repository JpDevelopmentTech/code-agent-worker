import { readFileSync } from "node:fs";

/**
 * Lee al arrancar las reglas del agente que van al system prompt de Claude.
 * Sin archivo configurado devuelve `undefined` (desarrollo local). Si está
 * configurado pero no se puede leer o está vacío, lanza: es mejor que el
 * worker no arranque a que trabaje sin sus reglas.
 */
export function readAgentRules(path: string | undefined): string | undefined {
  if (path === undefined) return undefined;
  const rules = readFileSync(path, "utf8").trim();
  if (rules === "") throw new Error(`El archivo de reglas del agente está vacío: ${path}`);
  return rules;
}
