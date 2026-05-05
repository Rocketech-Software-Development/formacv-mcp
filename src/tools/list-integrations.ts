import type { ToolDefinition } from '../types.js';
import {
  listIntegrationsInputSchema,
  listIntegrationsOutputSchema,
} from '../schemas/list-integrations.js';
import type { ListIntegrationsOutputT } from '../schemas/list-integrations.js';
import { mockListIntegrations } from '../mocks/responses.js';

export const listIntegrationsTool: ToolDefinition = {
  name: 'list_integrations',
  description:
    'Inspect MCP-aware ATS connectors (Bullhorn, JobAdder, Vincere) plus roadmap CRM bridges (Salesforce, HubSpot) to understand which pathways are authenticated for push-back workflows.',
  inputSchema: listIntegrationsInputSchema,
  handler: async (args, ctx) => {
    const validated = listIntegrationsInputSchema.parse(args ?? {});
    if (ctx.isDemoMode) {
      return listIntegrationsOutputSchema.parse(mockListIntegrations(validated));
    }
    const result = await ctx.client.call<ListIntegrationsOutputT>('list_integrations', validated);
    return listIntegrationsOutputSchema.parse(result);
  },
};
