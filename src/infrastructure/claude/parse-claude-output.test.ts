import { describe, expect, it } from "vitest";
import { RunStepError } from "../../domain/errors/run-step.error";
import { parseClaudeOutput } from "./parse-claude-output";

const success = {
  type: "result",
  subtype: "success",
  is_error: false,
  result: "Hice el cambio y los tests pasan.",
  num_turns: 12,
  total_cost_usd: 0.42,
  session_id: "abc",
};

describe("parseClaudeOutput", () => {
  it("should return the summary, turns and cost when Claude succeeds", () => {
    expect(parseClaudeOutput(JSON.stringify(success))).toEqual({
      summary: "Hice el cambio y los tests pasan.",
      turns: 12,
      costUsd: 0.42,
    });
  });

  it("should read the last line when there is noise before the JSON", () => {
    const stdout = `aviso suelto\n${JSON.stringify(success)}\n`;

    expect(parseClaudeOutput(stdout).summary).toBe("Hice el cambio y los tests pasan.");
  });

  it("should use a default summary when Claude returns no result", () => {
    const { result: _ignored, ...withoutResult } = success;

    expect(parseClaudeOutput(JSON.stringify(withoutResult)).summary).toBe(
      "Claude Code no devolvió un resumen.",
    );
  });

  it("should throw a readable error when is_error is true", () => {
    const stdout = JSON.stringify({ ...success, is_error: true, subtype: "error_max_turns" });

    expect(() => parseClaudeOutput(stdout)).toThrow(RunStepError);
    expect(() => parseClaudeOutput(stdout)).toThrow(/error_max_turns/);
  });

  it("should throw when stdout is not JSON", () => {
    expect(() => parseClaudeOutput("Error: no autenticado")).toThrow(/formato JSON esperado/);
  });

  it("should throw when the JSON lacks is_error", () => {
    expect(() => parseClaudeOutput(JSON.stringify({ result: "hola" }))).toThrow(RunStepError);
  });
});
