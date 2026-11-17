import type { AgentResult } from "../../domain/entities/agent-result.entity";
import { RunStepError } from "../../domain/errors/run-step.error";
import { EMPTY_AGENT_SUMMARY } from "../../shared/constants/pull-request.constants";
import { STDERR_TAIL_LENGTH } from "../../shared/constants/process.constants";
import { parseJsonOrUndefined } from "../../shared/utils/parse-json-or-undefined";
import { tailText } from "../../shared/utils/tail-text";
import { type ClaudeOutput, claudeOutputSchema } from "./claude-output.schema";

/**
 * Lee el resultado de stdout. Con `stream-json` cada línea es un evento y el
 * resultado es la última línea no vacía; con `json` todo stdout es un objeto.
 * Prueba las dos formas y devuelve `undefined` si nada es JSON.
 */
function readJson(stdout: string): unknown {
  const trimmed = stdout.trim();
  const lastLine = trimmed.split("\n").filter((line) => line.trim() !== "").pop() ?? "";
  return parseJsonOrUndefined(trimmed) ?? parseJsonOrUndefined(lastLine);
}

/** Valida la salida de Claude; `undefined` si no tiene la forma esperada. */
export function tryParseClaudeOutput(stdout: string): ClaudeOutput | undefined {
  const parsed = claudeOutputSchema.safeParse(readJson(stdout));
  return parsed.success ? parsed.data : undefined;
}

/**
 * Convierte la salida de Claude Code en el resultado del agente.
 * Lanza `RunStepError` si no es el JSON esperado o si Claude informa de un error.
 */
export function parseClaudeOutput(stdout: string): AgentResult {
  const output = tryParseClaudeOutput(stdout);
  if (output === undefined) {
    throw new RunStepError("La salida de Claude Code no tiene el formato JSON esperado.");
  }
  if (output.is_error) {
    const detail = tailText(output.result ?? "", STDERR_TAIL_LENGTH);
    throw new RunStepError(
      `Claude Code terminó con error (${output.subtype ?? "sin subtipo"})${detail === "" ? "." : `: ${detail}`}`,
    );
  }
  const summary = output.result?.trim() ?? "";
  return {
    summary: summary === "" ? EMPTY_AGENT_SUMMARY : summary,
    ...(output.num_turns === undefined ? {} : { turns: output.num_turns }),
    ...(output.total_cost_usd === undefined ? {} : { costUsd: output.total_cost_usd }),
  };
}
