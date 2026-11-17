import type { AgentResult } from "../domain/entities/agent-result.entity";
import type { CodeAgent, CodeAgentRequest } from "../domain/ports/code-agent.port";

/** Agente cuyo comportamiento decide cada test. */
export class FakeCodeAgent implements CodeAgent {
  readonly prompts: string[] = [];

  /** Recibe la función que simula la ejecución del agente. */
  constructor(private readonly behavior: (request: CodeAgentRequest) => Promise<AgentResult>) {}

  /** Guarda el prompt y delega en el comportamiento configurado. */
  async run(request: CodeAgentRequest): Promise<AgentResult> {
    this.prompts.push(request.prompt);
    return this.behavior(request);
  }
}

/** Comportamiento que espera hasta que se aborte la señal y entonces falla. */
export function waitUntilAborted(request: CodeAgentRequest): Promise<AgentResult> {
  return new Promise((_resolve, reject) => {
    request.signal.addEventListener("abort", () => reject(new Error("Claude abortado")), {
      once: true,
    });
  });
}
