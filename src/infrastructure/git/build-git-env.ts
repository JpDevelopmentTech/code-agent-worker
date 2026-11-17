import { GITHUB_EXTRAHEADER_CONFIG_KEY } from "../../shared/constants/github.constants";
import type { ChildBaseEnv } from "../../shared/types/child-base-env.types";

/**
 * Entorno de un proceso git. Sin credenciales por defecto; con `basicCredentials`
 * añade la cabecera de autenticación vía GIT_CONFIG_* para que el token viva
 * solo en el entorno de ese proceso: nunca en la URL, en argv ni en `.git/config`.
 */
export function buildGitEnv(
  base: ChildBaseEnv,
  basicCredentials?: string,
): Record<string, string> {
  const env: Record<string, string> = { ...base, GIT_TERMINAL_PROMPT: "0" };
  if (basicCredentials === undefined) return env;
  return {
    ...env,
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: GITHUB_EXTRAHEADER_CONFIG_KEY,
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${basicCredentials}`,
  };
}
