import { GITHUB_TOKEN_BASIC_USER } from "../../shared/constants/github.constants";

/**
 * Codifica el token de GitHub como credenciales básicas (`x-access-token:<token>`
 * en base64), que es lo que GitHub acepta en la cabecera AUTHORIZATION de git.
 */
export function encodeGithubBasicCredentials(githubToken: string): string {
  return Buffer.from(`${GITHUB_TOKEN_BASIC_USER}:${githubToken}`, "utf8").toString("base64");
}
