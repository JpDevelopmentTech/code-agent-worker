/** Raíz de la API REST de GitHub. */
export const GITHUB_API_URL = "https://api.github.com";

/** Raíz HTTPS para clonar y subir repositorios. */
export const GITHUB_GIT_BASE_URL = "https://github.com";

/** Cabeceras fijas de la API REST de GitHub. */
export const GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
export const GITHUB_API_VERSION = "2022-11-28";

/** Usuario que GitHub espera junto a un token en autenticación básica. */
export const GITHUB_TOKEN_BASIC_USER = "x-access-token";

/** Clave de configuración de git que inyecta la cabecera de autenticación. */
export const GITHUB_EXTRAHEADER_CONFIG_KEY = "http.https://github.com/.extraheader";

/** Tiempo máximo de la llamada que abre el PR. */
export const GITHUB_REQUEST_TIMEOUT_MS = 30_000;
