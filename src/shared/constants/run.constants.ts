/** Tope de caracteres del resumen que acepta el backend. */
export const MAX_SUMMARY_LENGTH = 4000;

/** Tope de caracteres del mensaje de error que acepta el backend. */
export const MAX_ERROR_LENGTH = 1000;

/** Tope de caracteres del error de cada repositorio que acepta el backend. */
export const MAX_REPOSITORY_ERROR_LENGTH = 500;

/** Máximo de repositorios por ejecución que acepta el backend. */
export const MAX_RUN_REPOSITORIES = 5;

/** Error que se informa cuando el agente termina sin commits nuevos. */
export const NO_CHANGES_ERROR = "El agente no hizo cambios.";

/** Prefijo del mensaje cuando falla algo que no es un paso conocido. */
export const UNEXPECTED_ERROR_PREFIX = "Error inesperado del worker";

/** Motivo de aborto cuando el backend dice que la ejecución ya no es nuestra. */
export const ABORT_REASON_LOST = "heartbeat-lost";

/** Motivo de aborto cuando el contenedor se está apagando. */
export const ABORT_REASON_SHUTDOWN = "shutdown";
