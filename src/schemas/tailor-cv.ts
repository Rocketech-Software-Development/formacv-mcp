import { z } from 'zod';

import { cvPayloadSchema } from './format-cv.js';

export const tailorCvInputSchema = z.object({
  cv: cvPayloadSchema,
  vacancy_text: z.string().min(1),
  instructions: z.string().min(1),
  template_id: z.string().min(1).optional(),
});

export const tailorCvOutputSchema = z.object({
  job_id: z.string(),
  status: z.enum(['queued', 'completed']),
  tailored_cv: z
    .object({
      url: z.string().url(),
      base64: z.string().optional(),
    })
    .optional(),
  changes_summary: z.array(z.string()).optional(),
  _demo: z.literal(true).optional(),
});

export type TailorCvInputT = z.infer<typeof tailorCvInputSchema>;
export type TailorCvOutputT = z.infer<typeof tailorCvOutputSchema>;
