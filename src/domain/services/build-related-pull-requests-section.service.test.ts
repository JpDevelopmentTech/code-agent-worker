import { describe, expect, it } from "vitest";
import { buildRelatedPullRequestsSection } from "./build-related-pull-requests-section.service";

describe("buildRelatedPullRequestsSection", () => {
  it("should title the section and list each related PR with its repository", () => {
    const section = buildRelatedPullRequestsSection([
      { repositoryFullName: "jpdev/api", url: "https://github.com/jpdev/api/pull/7" },
      { repositoryFullName: "jpdev/web", url: "https://github.com/jpdev/web/pull/9" },
    ]);

    expect(section).toBe(
      "## PRs de esta misma tarea\n\n- jpdev/api: https://github.com/jpdev/api/pull/7\n- jpdev/web: https://github.com/jpdev/web/pull/9",
    );
  });
});
