import type { AgentResult } from "../../domain/entities/agent-result.entity";
import { RunStepError } from "../../domain/errors/run-step.error";
import type { CodeAgent, CodeAgentRequest } from "../../domain/ports/code-agent.port";
import { CLAUDE_BINARY } from "../../shared/constants/claude.constants";
import { STDERR_TAIL_LENGTH } from "../../shared/constants/process.constants";
import type { ChildBaseEnv } from "../../shared/types/child-base-env.types";
import type { CommandResult } from "../../shared/types/command.types";
import { tailText } from "../../shared/utils/tail-text";
import { describeCommandFailure } from "../process/describe-command-failure";
import { runCommand } from "../process/run-command";
import { buildClaudeArgs, type ClaudeCliOptions } from "./build-claude-args";
import { buildClaudeEnv } from "./build-claude-env";
import { parseClaudeOutput, tryParseClaudeOutput } from "./parse-claude-output";

/** Configuración del adaptador de Claude Code. */
export interface ClaudeCodeAgentOptions extends ClaudeCliOptions {
  oauthToken: string;
  timeoutMs: number;
  baseEnv: ChildBaseEnv;
}

/** Agente de código que ejecuta la CLI de Claude Code en modo headless. */
export class ClaudeCodeAgent implements CodeAgent {
  /** Recibe la configuración ya validada. */
  constructor(private readonly options: ClaudeCodeAgentOptions) {}

  /** Lanza Claude en el clon con el prompt por stdin e interpreta su salida. */
  async run(request: CodeAgentRequest): Promise<AgentResult> {
    const result = await runCommand({
      command: CLAUDE_BINARY,
      args: buildClaudeArgs(this.options),
      cwd: request.workingDirectory,
      env: buildClaudeEnv(this.options.baseEnv, this.options.oauthToken),
      stdin: request.prompt,
      timeoutMs: this.options.timeoutMs,
      signal: request.signal,
    });
    if (result.exitCode !== 0 || result.timedOut || result.aborted) {
      throw new RunStepError(this.describeFailure(result));
    }
    return parseClaudeOutput(result.stdout);
  }

  /** Mensaje de fallo con el final de stderr y, si lo hay, lo que dijo Claude. */
  private describeFailure(result: CommandResult): string {
    const base = describeCommandFailure("Claude Code falló", result, this.options.timeoutMs);
    const said = tailText(tryParseClaudeOutput(result.stdout)?.result ?? "", STDERR_TAIL_LENGTH);
    return said === "" ? base : `${base} Claude dijo: ${said}`;
  }
}
