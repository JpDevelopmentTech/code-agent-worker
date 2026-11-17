import { loadEnv } from "./infrastructure/config/env";
import { buildWorker } from "./infrastructure/build-worker";
import { describeError } from "./shared/utils/describe-error";

/**
 * Punto de entrada: valida el entorno, arma el worker, conecta las señales de
 * apagado y corre el bucle. Con SIGTERM/SIGINT deja de pedir trabajo y aborta
 * lo que esté en curso; el bloqueo vencido devuelve esa ejecución a la cola.
 */
async function main(): Promise<void> {
  const env = loadEnv(process.env);
  const { loop, logger } = buildWorker(env, process.env);
  process.once("SIGTERM", () => loop.stop());
  process.once("SIGINT", () => loop.stop());
  try {
    await loop.run();
  } catch (error) {
    logger.error("El worker se detuvo por un error", { error: describeError(error) });
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({ level: "error", time: new Date().toISOString(), message: describeError(error) })}\n`,
  );
  process.exitCode = 1;
});
