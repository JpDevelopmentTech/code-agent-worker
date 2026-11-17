/** Variables mínimas que todo proceso hijo necesita para funcionar. */
export interface ChildBaseEnv {
  PATH: string;
  HOME: string;
  LANG: string;
}
