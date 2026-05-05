import { z } from 'zod';

export const pushToAtsInputSchema = z.object({
  formatted_cv_id: z.string().min(1),
  ats: z.enum(['bullhorn', 'jobadder', 'vincere']),
  candidate_id: z.string().min(1),
  attach_as: z.enum(['replace', 'new_attachment']).optional(),
});

export const pushToAtsOutputSchema = z.object({
  success: z.boolean(),
  ats_attachment_id: z.string().optional(),
  ats: z.string(),
  pushed_at: z.string(),
  _demo: z.literal(true).optional(),
});

export type PushToAtsInputT = z.infer<typeof pushToAtsInputSchema>;
export type PushToAtsOutputT = z.infer<typeof pushToAtsOutputSchema>;
