import {
  BACKEND_REQUEST_TIMEOUT_MS,
  CODE_AGENT_API_PREFIX,
} from "../../shared/constants/backend-api.constants";
import { describeError } from "../../shared/utils/describe-error";
import { BackendRequestError } from "./backend-request-error";

/** Respuesta ya leída del backend: código y cuerpo como texto. */
export interface BackendResponse {
  status: number;
  bodyText: string;
}

/**
 * Cliente HTTP mínimo de la API interna del worker: añade la autenticación,
 * el tipo de contenido y un tiempo máximo, y siempre consume el cuerpo.
 */
export class BackendHttpClient {
  private readonly baseUrl: string;

  /** Recibe la URL del backend (sin barra final) y el token del worker. */
  constructor(apiUrl: string, private readonly workerToken: string) {
    this.baseUrl = `${apiUrl}${CODE_AGENT_API_PREFIX}`;
  }

  /** Hace un POST con body JSON opcional; lanza `BackendRequestError` si falla la red. */
  async post(path: string, body?: unknown): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.workerToken}`,
          "Content-Type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(BACKEND_REQUEST_TIMEOUT_MS),
      });
      return { status: response.status, bodyText: await response.text() };
    } catch (error) {
      throw new BackendRequestError(`POST ${path} falló: ${describeError(error)}`);
    }
  }
}
