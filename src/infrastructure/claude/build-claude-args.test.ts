import { describe, expect, it } from "vitest";
import { buildClaudeArgs } from "./build-claude-args";

describe("buildClaudeArgs", () => {
  it("should run headless with stream-json and no extra flags when nothing is configured", () => {
    expect(buildClaudeArgs({})).toEqual([
      "-p",
      "--output-format",
      "stream-json",
      "--verbose",
      "--dangerously-skip-permissions",
    ]);
  });

  it("should add the model and the effort when they are configured", () => {
    expect(buildClaudeArgs({ model: "claude-opus-5-5", effort: "medium" }).slice(-4)).toEqual([
      "--model",
      "claude-opus-5-5",
      "--effort",
      "medium",
    ]);
  });

  it("should append the agent rules to the system prompt when they are loaded", () => {
    expect(buildClaudeArgs({ appendSystemPrompt: "Reglas" }).slice(-2)).toEqual([
      "--append-system-prompt",
      "Reglas",
    ]);
  });
});
