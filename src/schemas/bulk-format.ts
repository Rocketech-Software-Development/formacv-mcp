import { z } from 'zod';

export const bulkFormatInputSchema = z.object({
  cv_ids: z.array(z.string().min(1)).min(1),
  template_id: z.string().min(1),
  options: z
    .object({
      language: z.string().optional(),
      ats_safe: z.boolean().optional(),
    })
    .optional(),
});

export const bulkFormatOutputSchema = z.object({
  batch_id: z.string(),
  total: z.number().int().nonnegative(),
  queued: z.number().int().nonnegative(),
  status: z.literal('queued'),
  _demo: z.literal(true).optional(),
});

export type BulkFormatInputT = z.infer<typeof bulkFormatInputSchema>;
export type BulkFormatOutputT = z.infer<typeof bulkFormatOutputSchema>;
