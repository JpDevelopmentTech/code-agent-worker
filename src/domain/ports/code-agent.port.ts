import type { AgentResult } from "../entities/agent-result.entity";

/** Petición al agente: dónde trabajar y qué hacer. */
export interface CodeAgentRequest {
  workingDirectory: string;
  prompt: string;
  signal: AbortSignal;
  /**
   * Recibe la transcripción de la sesión en cuanto el agente termina, también
   * cuando falla: es justo el caso en que más interesa ver qué hizo.
   */
  onTranscript?: (transcript: string) => void;
}

/** Agente de código que implementa una tarea dentro de un repositorio clonado. */
export interface CodeAgent {
  /** Ejecuta al agente; lanza un error legible si falla o se pasa de tiempo. */
  run(request: CodeAgentRequest): Promise<AgentResult>;
}
