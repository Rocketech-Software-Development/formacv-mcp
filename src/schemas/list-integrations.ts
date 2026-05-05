import { z } from 'zod';

export const listIntegrationsInputSchema = z.object({});

export const integrationRowSchema = z.object({
  ats: z.enum(['bullhorn', 'jobadder', 'vincere', 'salesforce', 'hubspot']),
  status: z.enum(['connected', 'pending', 'disconnected']),
  connected_at: z.string().optional(),
});

export const listIntegrationsOutputSchema = z.object({
  integrations: z.array(integrationRowSchema),
  _demo: z.literal(true).optional(),
});

export type ListIntegrationsInputT = z.infer<typeof listIntegrationsInputSchema>;
export type ListIntegrationsOutputT = z.infer<typeof listIntegrationsOutputSchema>;
