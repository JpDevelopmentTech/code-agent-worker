import type { ChildBaseEnv } from "../../shared/types/child-base-env.types";

/**
 * Entorno mínimo de Claude Code, construido a mano: PATH, HOME, LANG, su token
 * OAuth y CI. A propósito no incluye el token de GitHub ni el del backend:
 * el agente no puede hacer push ni hablar con JOLUP aunque lo intente.
 */
export function buildClaudeEnv(base: ChildBaseEnv, oauthToken: string): Record<string, string> {
  return {
    PATH: base.PATH,
    HOME: base.HOME,
    LANG: base.LANG,
    CLAUDE_CODE_OAUTH_TOKEN: oauthToken,
    CI: "true",
  };
}
