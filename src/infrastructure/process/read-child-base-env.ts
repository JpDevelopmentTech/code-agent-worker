import { homedir } from "node:os";
import { DEFAULT_CHILD_LANG } from "../../shared/constants/process.constants";
import type { ChildBaseEnv } from "../../shared/types/child-base-env.types";

/**
 * Toma del entorno del worker solo PATH, HOME y LANG. Es la base de los
 * entornos de los hijos, que se construyen a mano para no filtrar secretos.
 */
export function readChildBaseEnv(source: NodeJS.ProcessEnv): ChildBaseEnv {
  return {
    PATH: source.PATH ?? "/usr/local/bin:/usr/bin:/bin",
    HOME: source.HOME ?? homedir(),
    LANG: source.LANG ?? DEFAULT_CHILD_LANG,
  };
}
