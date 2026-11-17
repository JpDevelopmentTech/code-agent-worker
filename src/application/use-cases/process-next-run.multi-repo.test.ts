import { describe, expect, it } from "vitest";
import { RunStepError } from "../../domain/errors/run-step.error";
import { buildUseCaseHarness } from "../../test-support/build-use-case";
import { fakePullRequestUrl } from "../../test-support/fake-pull-request-publisher";
import { FAKE_SECRET } from "../../test-support/fake-redactor";
import { buildMultiRepoRun, MAIN_REPOSITORY_ID, SECOND_REPOSITORY } from "../../test-support/run-fixture";

const noShutdown = (): AbortSignal => new AbortController().signal;
const SECOND_ID = SECOND_REPOSITORY.id ?? "";
const DEMO_PR = fakePullRequestUrl("jpdev/demo");
const WEB_PR = fakePullRequestUrl("jpdev/web");

describe("ProcessNextRunUseCase with several repositories", () => {
  it("should clone each repository in its own folder and run Claude in the parent directory", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });

    await harness.useCase.execute(noShutdown());

    expect(harness.repository.calls.slice(0, 4)).toEqual([
      "clone jpdev/demo@main",
      "branch jolup/tarea-123",
      "clone jpdev/web@develop",
      "branch jolup/tarea-123",
    ]);
    expect(harness.repository.clonedDirectories).toEqual(["/tmp/fake/run-1/demo", "/tmp/fake/run-1/web"]);
    expect(harness.agent.workingDirectories).toEqual(["/tmp/fake/run-1"]);
    expect(harness.agent.prompts[0]).toContain("`web/`: jpdev/web (rama base: develop)");
  });

  it("should open two PRs, link them to each other and finish as done with the first one", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("done");
    expect(harness.publisher.drafts.map((draft) => [draft.repositoryFullName, draft.base])).toEqual([
      ["jpdev/demo", "main"],
      ["jpdev/web", "develop"],
    ]);
    expect(harness.queue.finished[0]?.report).toEqual({
      outcome: "done",
      prUrl: DEMO_PR,
      summary: "Añadí la validación y pasé los tests.",
      repositories: [
        { repositoryId: MAIN_REPOSITORY_ID, outcome: "pr_opened", prUrl: DEMO_PR },
        { repositoryId: SECOND_ID, outcome: "pr_opened", prUrl: WEB_PR },
      ],
    });
    const [demoUpdate, webUpdate] = harness.publisher.bodyUpdates;
    expect(demoUpdate?.reference).toEqual({ repositoryFullName: "jpdev/demo", number: 42 });
    expect(demoUpdate?.body).toContain(`## PRs de esta misma tarea\n\n- jpdev/web: ${WEB_PR}`);
    expect(demoUpdate?.body.startsWith(harness.publisher.drafts[0]?.body ?? "-")).toBe(true);
    expect(webUpdate?.body).toContain(`- jpdev/demo: ${DEMO_PR}`);
    expect(webUpdate?.body).not.toContain(WEB_PR);
  });

  it("should finish as done with the second PR when only the second repository has commits", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.repository.commitsByFolder["demo"] = 0;

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("done");
    expect(harness.repository.pushedFolders).toEqual(["web"]);
    expect(harness.publisher.bodyUpdates).toEqual([]);
    expect(harness.queue.finished[0]?.report).toMatchObject({
      outcome: "done",
      prUrl: WEB_PR,
      repositories: [
        { repositoryId: MAIN_REPOSITORY_ID, outcome: "no_changes" },
        { repositoryId: SECOND_ID, outcome: "pr_opened", prUrl: WEB_PR },
      ],
    });
  });

  it("should keep going and report the failed repository when the second push fails", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.repository.pushErrors["web"] = new RunStepError(
      `No se pudo subir la rama jolup/tarea-123: fatal: token ${FAKE_SECRET} rechazado ${"x".repeat(600)}`,
    );

    const status = await harness.useCase.execute(noShutdown());

    const report = harness.queue.finished[0]?.report;
    expect(status).toBe("done");
    expect(report).toMatchObject({
      outcome: "done",
      prUrl: DEMO_PR,
      repositories: [
        { repositoryId: MAIN_REPOSITORY_ID, outcome: "pr_opened", prUrl: DEMO_PR },
        { repositoryId: SECOND_ID, outcome: "failed" },
      ],
    });
    const failed = report?.repositories?.[1];
    const error = failed?.outcome === "failed" ? failed.error : "";
    expect(error).toContain("No se pudo subir la rama jolup/tarea-123: fatal: token [REDACTADO]");
    expect(error.length).toBe(500);
    expect(JSON.stringify(report)).not.toContain(FAKE_SECRET);
    expect(harness.publisher.drafts).toHaveLength(1);
  });

  it("should finish as failed with the first repository error when no PR could be opened", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.repository.commitsByFolder["demo"] = 0;
    harness.publisher.openErrors["jpdev/web"] = new RunStepError("GitHub rechazó el Pull Request (HTTP 422)");

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("failed");
    expect(harness.queue.finished[0]?.report).toMatchObject({
      outcome: "failed",
      error: "jpdev/web: GitHub rechazó el Pull Request (HTTP 422)",
    });
  });

  it("should finish as failed with the usual message when no repository has changes", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.repository.newCommits = 0;

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("failed");
    expect(harness.publisher.drafts).toEqual([]);
    expect(harness.queue.finished[0]?.report).toEqual({
      outcome: "failed",
      error: "El agente no hizo cambios.",
      summary: "Añadí la validación y pasé los tests.",
      repositories: [
        { repositoryId: MAIN_REPOSITORY_ID, outcome: "no_changes" },
        { repositoryId: SECOND_ID, outcome: "no_changes" },
      ],
    });
  });

  it("should still finish as done when linking the PRs fails", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.publisher.updateError = new RunStepError("GitHub rechazó el Pull Request (HTTP 500)");

    const status = await harness.useCase.execute(noShutdown());

    expect(status).toBe("done");
    expect(harness.queue.finished[0]?.report).toMatchObject({ outcome: "done", prUrl: DEMO_PR });
    const warnings = harness.logger.entries.filter((entry) => entry.level === "warn");
    expect(warnings.map((entry) => entry.message)).toContain("No se pudo enlazar el PR con los demás de la tarea");
  });

  it("should finish as a global failure without repositories when a clone fails", async () => {
    const harness = buildUseCaseHarness({ run: buildMultiRepoRun() });
    harness.repository.cloneError = new RunStepError("No se pudo clonar jpdev/demo.");

    await harness.useCase.execute(noShutdown());

    expect(harness.queue.finished[0]?.report).toEqual({ outcome: "failed", error: "No se pudo clonar jpdev/demo." });
    expect(harness.agent.prompts).toEqual([]);
  });
});
