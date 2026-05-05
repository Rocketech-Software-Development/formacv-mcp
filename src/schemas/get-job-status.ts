import { z } from 'zod';

export const getJobStatusInputSchema = z.object({
  job_id: z.string().min(1),
});

export const getJobStatusOutputSchema = z.object({
  job_id: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  result_url: z.string().url().optional(),
  error: z.string().optional(),
  percent_complete: z.number().min(0).max(100).optional(),
  _demo: z.literal(true).optional(),
});

export type GetJobStatusInputT = z.infer<typeof getJobStatusInputSchema>;
export type GetJobStatusOutputT = z.infer<typeof getJobStatusOutputSchema>;
