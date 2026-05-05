import { z } from 'zod';

import { cvPayloadSchema } from './format-cv.js';

const stripFieldSchema = z.enum([
  'name',
  'email',
  'phone',
  'photo',
  'address',
  'company_names',
]);

export const anonymizeCvInputSchema = z.object({
  cv: cvPayloadSchema,
  fields_to_strip: z.array(stripFieldSchema).optional(),
  audit_log: z.boolean().optional(),
});

export const anonymizeCvOutputSchema = z.object({
  job_id: z.string(),
  status: z.enum(['queued', 'completed']),
  anonymized_cv: z
    .object({
      url: z.string().url(),
      base64: z.string().optional(),
    })
    .optional(),
  audit: z
    .object({
      fields_removed: z.array(z.string()),
      audit_id: z.string(),
    })
    .optional(),
  _demo: z.literal(true).optional(),
});

export type AnonymizeCvInputT = z.infer<typeof anonymizeCvInputSchema>;
export type AnonymizeCvOutputT = z.infer<typeof anonymizeCvOutputSchema>;
