import { z } from 'zod';

export const listTemplatesInputSchema = z.object({
  filters: z
    .object({
      client: z.string().optional(),
      branch: z.string().optional(),
      user: z.string().optional(),
      category: z.enum(['standard', 'compliance', 'anonymized']).optional(),
    })
    .optional(),
});

export const templateRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['standard', 'compliance', 'anonymized']),
  last_updated: z.string(),
});

export const listTemplatesOutputSchema = z.object({
  templates: z.array(templateRowSchema),
  _demo: z.literal(true).optional(),
});

export type ListTemplatesInputT = z.infer<typeof listTemplatesInputSchema>;
export type ListTemplatesOutputT = z.infer<typeof listTemplatesOutputSchema>;
