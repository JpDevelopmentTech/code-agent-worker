import { describe, expect, it } from "vitest";
import type { RepositoryCheckout } from "../entities/repository-checkout.entity";
import { buildMultiRepoTaskPrompt } from "./build-multi-repo-task-prompt.service";
import { buildTaskPrompt } from "./build-task-prompt.service";

const task = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  title: "Añadir el campo teléfono",
  description: "El backend lo guarda y el frontend lo pide.",
};

const checkouts: RepositoryCheckout[] = [
  { repository: { fullName: "jpdev/api", baseBranch: "main" }, folder: "api", directory: "/w/run-1/api" },
  { repository: { fullName: "jpdev/web", baseBranch: "develop" }, folder: "web", directory: "/w/run-1/web" },
];

describe("buildMultiRepoTaskPrompt", () => {
  it("should list each repository with its folder and base branch when there are several", () => {
    const prompt = buildMultiRepoTaskPrompt(task, checkouts);

    expect(prompt).toContain("- `api/`: jpdev/api (rama base: main)\n- `web/`: jpdev/web (rama base: develop)");
  });

  it("should ask for commits inside each repository and say the parent is not a repository", () => {
    const prompt = buildMultiRepoTaskPrompt(task, checkouts);

    expect(prompt).toContain("Haz los commits DENTRO de cada repositorio que toques");
    expect(prompt).toContain("Esa carpeta NO es un repositorio git");
    expect(prompt).toContain("No toques los que no los necesiten");
    expect(prompt).toContain("Mantén coherentes los contratos entre repositorios");
    expect(prompt).toContain("en qué orden conviene fusionar los Pull Requests");
  });

  it("should keep the task data and the non-negotiable rules", () => {
    const prompt = buildMultiRepoTaskPrompt(task, checkouts);

    expect(prompt).toContain("<titulo_de_la_tarea>\nAñadir el campo teléfono\n</titulo_de_la_tarea>");
    expect(prompt).toContain("NO hagas push");
    expect(prompt).toContain("NO cambies de rama");
  });

  it("should not expand a repositories placeholder written inside the task data", () => {
    const prompt = buildMultiRepoTaskPrompt({ ...task, description: "{{REPOSITORIOS}}" }, checkouts);

    expect(prompt.match(/jpdev\/web \(rama base/g)).toHaveLength(1);
  });

  it("should leave the single repository prompt without any of the multi repository text", () => {
    const prompt = buildTaskPrompt(task);

    expect(prompt).toContain("implementa una tarea en este repositorio");
    expect(prompt).toContain("Haz uno o varios commits con Conventional Commits en la rama actual.");
    expect(prompt).not.toContain("{{REPOSITORIOS}}");
    expect(prompt).not.toContain("varios repositorios");
    expect(prompt).not.toContain("rama base:");
  });
});
