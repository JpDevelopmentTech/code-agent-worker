import type { CloneRequest, SourceRepository } from "../../domain/ports/source-repository.port";
import { RunStepError } from "../../domain/errors/run-step.error";
import { GITHUB_GIT_BASE_URL } from "../../shared/constants/github.constants";
import { GIT_COMMAND_TIMEOUT_MS } from "../../shared/constants/process.constants";
import type { ChildBaseEnv } from "../../shared/types/child-base-env.types";
import { describeCommandFailure } from "../process/describe-command-failure";
import { runCommand } from "../process/run-command";
import { buildGitEnv } from "./build-git-env";
import { encodeGithubBasicCredentials } from "./github-basic-credentials";

/** Configuración del adaptador de git. */
export interface GitCliOptions {
  githubToken: string;
  authorName: string;
  authorEmail: string;
  baseEnv: ChildBaseEnv;
}

/** Repositorio de código manejado con el binario `git` del contenedor. */
export class GitCliRepository implements SourceRepository {
  private readonly credentials: string;

  /** Precalcula las credenciales básicas a partir del token de GitHub. */
  constructor(private readonly options: GitCliOptions) {
    this.credentials = encodeGithubBasicCredentials(options.githubToken);
  }

  /** Clona solo la rama base, autenticado por entorno. */
  async clone(request: CloneRequest, signal: AbortSignal): Promise<void> {
    const url = `${GITHUB_GIT_BASE_URL}/${request.repositoryFullName}.git`;
    const args = ["clone", "--branch", request.baseBranch, "--single-branch", url, request.directory];
    await this.git(args, undefined, signal, `No se pudo clonar ${request.repositoryFullName}`, true);
  }

  /** Crea la rama de trabajo y fija la identidad local de los commits. */
  async prepareBranch(directory: string, branch: string, signal: AbortSignal): Promise<void> {
    await this.git(["checkout", "-b", branch], directory, signal, `No se pudo crear la rama ${branch}`);
    const failure = "No se pudo configurar la identidad de git";
    await this.git(["config", "user.name", this.options.authorName], directory, signal, failure);
    await this.git(["config", "user.email", this.options.authorEmail], directory, signal, failure);
  }

  /** Cuenta los commits de HEAD que no están en `origin/<baseBranch>`. */
  async countNewCommits(directory: string, baseBranch: string, signal: AbortSignal): Promise<number> {
    const range = `origin/${baseBranch}..HEAD`;
    const output = await this.git(["rev-list", "--count", range], directory, signal, "No se pudieron contar los commits");
    const count = Number.parseInt(output.trim(), 10);
    if (Number.isNaN(count)) throw new RunStepError(`git rev-list devolvió algo inesperado: ${output.trim()}`);
    return count;
  }

  /** Sube la rama de trabajo al remoto, autenticado por entorno. */
  async push(directory: string, branch: string, signal: AbortSignal): Promise<void> {
    await this.git(["push", "origin", branch], directory, signal, `No se pudo subir la rama ${branch}`, true);
  }

  /** Ejecuta un comando git; devuelve stdout o lanza `RunStepError` con el motivo. */
  private async git(
    args: string[],
    cwd: string | undefined,
    signal: AbortSignal,
    failureMessage: string,
    authenticated = false,
  ): Promise<string> {
    const env = buildGitEnv(this.options.baseEnv, authenticated ? this.credentials : undefined);
    const result = await runCommand({ command: "git", args, cwd, env, timeoutMs: GIT_COMMAND_TIMEOUT_MS, signal });
    if (result.exitCode === 0 && !result.aborted && !result.timedOut) return result.stdout;
    throw new RunStepError(describeCommandFailure(failureMessage, result, GIT_COMMAND_TIMEOUT_MS));
  }
}
