import { z } from 'zod';

export const cvPayloadSchema = z.object({
  source: z.enum(['url', 'base64']),
  data: z.string(),
});

export const formatCvInputSchema = z.object({
  cv: cvPayloadSchema,
  template_id: z.string().min(1),
  options: z
    .object({
      language: z.string().optional(),
      ats_safe: z.boolean().optional(),
    })
    .optional(),
});

export const formatCvOutputSchema = z.object({
  job_id: z.string(),
  status: z.enum(['queued', 'completed']),
  formatted_cv: z
    .object({
      url: z.string().url(),
      base64: z.string().optional(),
    })
    .optional(),
  format: z.enum(['pdf', 'docx']),
  /** Present only in demo-mode responses (internal QA / tooling). */
  _demo: z.literal(true).optional(),
});

export type FormatCvInputT = z.infer<typeof formatCvInputSchema>;
export type FormatCvOutputT = z.infer<typeof formatCvOutputSchema>;
