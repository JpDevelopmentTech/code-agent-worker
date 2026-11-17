/** `alive`: el bloqueo se renovó. `lost`: la ejecución ya no es de este worker. */
export type HeartbeatStatus = "alive" | "lost";

/** `recorded`: el backend aceptó lo enviado (cierre o transcripción). `conflict`: ya no estaba en marcha. */
export type FinishStatus = "recorded" | "conflict";
