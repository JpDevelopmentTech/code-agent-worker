/** Lo que devuelve el agente de código cuando termina sin error. */
export interface AgentResult {
  /** Resumen en español de lo que hizo; irá en el cuerpo del PR. */
  summary: string;
  turns?: number;
  costUsd?: number;
}
