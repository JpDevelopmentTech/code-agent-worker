import { describe, expect, it } from "vitest";
import { claimResponseSchema } from "./claim-response.schema";

const baseRun = {
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  branch: "jolup/tarea-123",
  attempts: 1,
  task: { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", title: "Tarea", description: null },
  repository: { fullName: "jpdev/api", baseBranch: "main" },
};
const apiRepository = { id: "9b2f4a1e-1c3d-4e5f-8a9b-0c1d2e3f4a5b", fullName: "jpdev/api", baseBranch: "main" };
const webRepository = { id: "5d6e7f80-91a2-4b3c-8d4e-5f6a7b8c9d0e", fullName: "jpdev/web", baseBranch: "develop" };

describe("claimResponseSchema", () => {
  it("should keep the repositories in order when the backend sends them", () => {
    const parsed = claimResponseSchema.parse({ run: { ...baseRun, repositories: [apiRepository, webRepository] } });

    expect(parsed.run.repositories).toEqual([apiRepository, webRepository]);
  });

  it("should fall back to the main repository without id when the backend is older", () => {
    const parsed = claimResponseSchema.parse({ run: baseRun });

    expect(parsed.run.repositories).toEqual([{ fullName: "jpdev/api", baseBranch: "main" }]);
  });

  it("should reject a repository without id or with a name that would escape the workspace", () => {
    const withoutId = { run: { ...baseRun, repositories: [{ fullName: "jpdev/api", baseBranch: "main" }] } };
    const escaping = { run: { ...baseRun, repositories: [{ ...apiRepository, fullName: "jpdev/.." }] } };

    expect(claimResponseSchema.safeParse(withoutId).success).toBe(false);
    expect(claimResponseSchema.safeParse(escaping).success).toBe(false);
  });

  it("should reject more repositories than the backend accepts when finishing", () => {
    const six = Array.from({ length: 6 }, () => apiRepository);

    expect(claimResponseSchema.safeParse({ run: { ...baseRun, repositories: six } }).success).toBe(false);
  });
});
