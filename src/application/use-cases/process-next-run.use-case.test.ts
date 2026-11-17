import { describe, expect, it } from "vitest";
import { RunStepError } from "../../domain/errors/run-step.error";
import { buildUseCaseHarness } from "../../test-support/build-use-case";
import { waitUntilAborted } from "../../test-support/fake-code-agent";
import { FAKE_SECRET } from "../../test-support/fake-redactor";
import { buildRun, MAIN_REPOSITORY_ID } from "../../test-support/run-fixture";

const noShutdown = (): AbortSignal => new AbortController().signal;

describe("ProcessNextRunUseCase", () => {
  it("should return idle without touching anything when the queue is empty", async () => {
    const harness = buildUseCaseHarness({ run: null });

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("idle");
    expect(harness.workspace.created).toEqual([]);
    expect(harness.queue.finished).toEqual([]);
  });

  it("should push the branch, open the PR and finish as done when the agent commits", async () => {
    const run = buildRun();
    const harness = buildUseCaseHarness({ run });

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("done");
    expect(harness.repository.calls).toEqual([
      "clone jpdev/demo@main",
      "branch jolup/tarea-123",
      "count",
      "push jolup/tarea-123",
    ]);
    expect(harness.publisher.drafts[0]).toMatchObject({ head: run.branch, base: "main" });
    expect(harness.publisher.drafts[0]?.body).toContain(`Tarea de JOLUP: ${run.task.id}`);
    expect(harness.queue.finished).toEqual([
      {
        runId: run.id,
        report: {
          outcome: "done",
          prUrl: "https://github.com/jpdev/demo/pull/42",
          summary: "Añadí la validación y pasé los tests.",
          repositories: [
            { repositoryId: MAIN_REPOSITORY_ID, outcome: "pr_opened", prUrl: "https://github.com/jpdev/demo/pull/42" },
          ],
        },
      },
    ]);
  });

  it("should finish as failed with the agent summary when there are no new commits", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async () => ({ summary: "La tarea es ambigua; no hice cambios." }),
    });
    harness.repository.newCommits = 0;

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("failed");
    expect(harness.queue.finished[0]?.report).toEqual({
      outcome: "failed",
      error: "El agente no hizo cambios.",
      summary: "La tarea es ambigua; no hice cambios.",
      repositories: [{ repositoryId: MAIN_REPOSITORY_ID, outcome: "no_changes" }],
    });
    expect(harness.repository.calls).not.toContain("push jolup/tarea-123");
    expect(harness.publisher.drafts).toEqual([]);
  });

  it("should finish as failed with the step message when Claude fails", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async () => {
        throw new RunStepError("Claude Code falló: terminó con código 1.");
      },
    });

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("failed");
    expect(harness.queue.finished[0]?.report).toEqual({
      outcome: "failed",
      error: "Claude Code falló: terminó con código 1.",
    });
    expect(harness.repository.calls).not.toContain("count");
  });

  it("should abort without calling finish when the heartbeat answers 409", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: waitUntilAborted,
      heartbeatIntervalMs: 5,
    });
    harness.queue.heartbeatStatus = "lost";

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("aborted");
    expect(harness.queue.heartbeats).toBeGreaterThan(0);
    expect(harness.queue.finished).toEqual([]);
  });

  it("should abort without calling finish when the worker is shutting down", async () => {
    const shutdown = new AbortController();
    const harness = buildUseCaseHarness({ run: buildRun(), agent: waitUntilAborted });
    setTimeout(() => shutdown.abort(), 5);

    const status = await harness.useCase.execute(shutdown.signal);

    expect(status).toBe("aborted");
    expect(harness.queue.finished).toEqual([]);
  });

  it("should always remove the temporary directory when the run succeeds, fails or aborts", async () => {
    const happy = buildUseCaseHarness({ run: buildRun() });
    const failing = buildUseCaseHarness({ run: buildRun() });
    failing.repository.cloneError = new RunStepError("No se pudo clonar jpdev/demo.");
    const lost = buildUseCaseHarness({ run: buildRun(), agent: waitUntilAborted, heartbeatIntervalMs: 5 });
    lost.queue.heartbeatStatus = "lost";

    for (const harness of [happy, failing, lost]) {
      await harness.useCase.execute(noShutdown());
      expect(harness.workspace.removed).toEqual(harness.workspace.created);
      expect(harness.workspace.created).toHaveLength(1);
    }
  });

  it("should redact secrets and describe unexpected errors when a step throws", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async () => {
        throw new Error(`fallo con ${FAKE_SECRET}`);
      },
    });

    await harness.useCase.execute(noShutdown());

    const report = harness.queue.finished[0]?.report;
    expect(report?.outcome).toBe("failed");
    expect(JSON.stringify(report)).not.toContain(FAKE_SECRET);
    expect(report).toMatchObject({ error: "Error inesperado del worker: fallo con [REDACTADO]" });
  });

  it("should cut texts to the contract limits before calling finish", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async () => ({ summary: "x".repeat(5000) }),
    });

    await harness.useCase.execute(noShutdown());

    const report = harness.queue.finished[0]?.report;
    expect(report?.outcome === "done" ? report.summary.length : 0).toBe(4000);
  });

  it("should upload the redacted transcript before finishing and report the metrics", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async (request) => {
        request.onTranscript?.(`{"type":"assistant","text":"uso ${FAKE_SECRET}"}`);
        return { summary: "Hecho.", turns: 5, costUsd: 0.3 };
      },
    });

    await harness.useCase.execute(noShutdown());

    expect(harness.queue.calls).toEqual(["transcript", "finish"]);
    expect(harness.queue.transcripts[0]?.transcript).toBe('{"type":"assistant","text":"uso [REDACTADO]"}');
    expect(harness.queue.finished[0]?.report).toMatchObject({ outcome: "done", numTurns: 5, costUsd: 0.3 });
  });

  it("should keep the transcript when the agent fails after producing it", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async (request) => {
        request.onTranscript?.('{"type":"result","is_error":true}');
        throw new RunStepError("Claude Code terminó con error.");
      },
    });

    await harness.useCase.execute(noShutdown());

    expect(harness.queue.transcripts).toHaveLength(1);
    expect(harness.queue.finished[0]?.report).toMatchObject({ outcome: "failed" });
  });

  it("should still finish the run when the transcript upload fails", async () => {
    const harness = buildUseCaseHarness({
      run: buildRun(),
      agent: async (request) => {
        request.onTranscript?.("{}");
        return { summary: "Hecho." };
      },
    });
    harness.queue.uploadError = new Error("red caída");

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("done");
    expect(harness.queue.finished).toHaveLength(1);
    expect(harness.logger.entries.some((entry) => entry.message === "No se pudo subir la transcripción")).toBe(true);
  });

  it("should clone into a subfolder and run Claude inside the clone when there is a single repository", async () => {
    const harness = buildUseCaseHarness({ run: buildRun() });

    await harness.useCase.execute(noShutdown());

    expect(harness.repository.clonedDirectories).toEqual(["/tmp/fake/run-1/demo"]);
    expect(harness.agent.workingDirectories).toEqual(["/tmp/fake/run-1/demo"]);
    expect(harness.publisher.bodyUpdates).toEqual([]);
  });

  it("should leave repositories out of the report when the backend did not send their ids", async () => {
    const run = buildRun();
    const harness = buildUseCaseHarness({ run: { ...run, repositories: [run.repository] } });

    await harness.useCase.execute(noShutdown());

    expect(harness.queue.finished[0]?.report).toEqual({
      outcome: "done",
      prUrl: "https://github.com/jpdev/demo/pull/42",
      summary: "Añadí la validación y pasé los tests.",
    });
  });
});
