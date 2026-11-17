import { z } from "zod";

/**
 * Forma del JSON final de `claude -p --output-format json`. Solo se validan
 * los campos que usa el worker; el resto se deja pasar sin tocarlo.
 */
export const claudeOutputSchema = z.looseObject({
  is_error: z.boolean(),
  result: z.string().optional(),
  subtype: z.string().optional(),
  num_turns: z.number().optional(),
  total_cost_usd: z.number().optional(),
});

/** Salida de Claude Code ya validada. */
export type ClaudeOutput = z.infer<typeof claudeOutputSchema>;
