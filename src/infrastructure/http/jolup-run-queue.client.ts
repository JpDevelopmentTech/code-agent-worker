import { gzipSync } from "node:zlib";
import type { CodeAgentRun } from "../../domain/entities/code-agent-run.entity";
import type { FinishStatus, HeartbeatStatus } from "../../domain/entities/heartbeat-status.entity";
import type { RunFinishReport } from "../../domain/entities/run-finish-report.entity";
import type { RunQueue } from "../../domain/ports/run-queue.port";
import {
  CLAIM_PATH,
  FINISH_SUFFIX,
  HEARTBEAT_SUFFIX,
  HTTP_CONFLICT,
  HTTP_NO_CONTENT,
  HTTP_OK,
  MAX_ERROR_BODY_LENGTH,
  RUNS_PATH,
  TRANSCRIPT_CONTENT_TYPE,
  TRANSCRIPT_SUFFIX,
} from "../../shared/constants/backend-api.constants";
import { parseJsonOrUndefined } from "../../shared/utils/parse-json-or-undefined";
import { tailText } from "../../shared/utils/tail-text";
import type { BackendHttpClient, BackendResponse } from "./backend-http.client";
import { BackendRequestError } from "./backend-request-error";
import { claimResponseSchema } from "./claim-response.schema";

/** Cola de ejecuciones respaldada por la API interna del backend de JOLUP. */
export class JolupRunQueueClient implements RunQueue {
  /** Recibe el cliente HTTP ya autenticado. */
  constructor(private readonly http: BackendHttpClient) {}

  /** `POST /claim`: 204 → cola vacía; 200 → ejecución validada con Zod. */
  async claim(): Promise<CodeAgentRun | null> {
    const response = await this.http.post(CLAIM_PATH);
    if (response.status === HTTP_NO_CONTENT) return null;
    if (response.status !== HTTP_OK) throw this.unexpected(CLAIM_PATH, response);
    const parsed = claimResponseSchema.safeParse(parseJsonOrUndefined(response.bodyText));
    if (!parsed.success) {
      throw new BackendRequestError(`Respuesta de ${CLAIM_PATH} no válida: ${parsed.error.message}`);
    }
    return parsed.data.run;
  }

  /** `POST /runs/:id/heartbeat`: 204 → sigue siendo nuestra; 409 → perdida. */
  async heartbeat(runId: string): Promise<HeartbeatStatus> {
    const path = this.runPath(runId, HEARTBEAT_SUFFIX);
    const response = await this.http.post(path);
    if (response.status === HTTP_NO_CONTENT) return "alive";
    if (response.status === HTTP_CONFLICT) return "lost";
    throw this.unexpected(path, response);
  }

  /** `POST /runs/:id/transcript` con el JSONL en gzip: 204 → guardada; 409 → ya no estaba en marcha. */
  async uploadTranscript(runId: string, transcript: string): Promise<FinishStatus> {
    const path = this.runPath(runId, TRANSCRIPT_SUFFIX);
    const body = gzipSync(Buffer.from(transcript, "utf8"));
    const response = await this.http.postBinary(path, body, TRANSCRIPT_CONTENT_TYPE);
    if (response.status === HTTP_NO_CONTENT) return "recorded";
    if (response.status === HTTP_CONFLICT) return "conflict";
    throw this.unexpected(path, response);
  }

  /** `POST /runs/:id/finish`: 200 → registrado; 409 → ya no estaba en marcha. */
  async finish(runId: string, report: RunFinishReport): Promise<FinishStatus> {
    const path = this.runPath(runId, FINISH_SUFFIX);
    const response = await this.http.post(path, report);
    if (response.status === HTTP_OK) return "recorded";
    if (response.status === HTTP_CONFLICT) return "conflict";
    throw this.unexpected(path, response);
  }

  /** Construye `/runs/:id/<sufijo>` con el id escapado. */
  private runPath(runId: string, suffix: string): string {
    return `${RUNS_PATH}/${encodeURIComponent(runId)}${suffix}`;
  }

  /** Error para un código HTTP que el contrato no contempla. */
  private unexpected(path: string, response: BackendResponse): BackendRequestError {
    const body = tailText(response.bodyText, MAX_ERROR_BODY_LENGTH);
    return new BackendRequestError(`POST ${path} respondió HTTP ${response.status}: ${body}`);
  }
}
