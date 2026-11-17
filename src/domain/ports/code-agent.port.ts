import type { AgentResult } from "../entities/agent-result.entity";

/** Petición al agente: dónde trabajar y qué hacer. */
export interface CodeAgentRequest {
  workingDirectory: string;
  prompt: string;
  signal: AbortSignal;
}

/** Agente de código que implementa una tarea dentro de un repositorio clonado. */
export interface CodeAgent {
  /** Ejecuta al agente; lanza un error legible si falla o se pasa de tiempo. */
  run(request: CodeAgentRequest): Promise<AgentResult>;
}
