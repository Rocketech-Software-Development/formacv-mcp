import type { ToolDefinition } from '../types.js';
import { listTemplatesInputSchema, listTemplatesOutputSchema } from '../schemas/list-templates.js';
import type { ListTemplatesOutputT } from '../schemas/list-templates.js';
import { mockListTemplates } from '../mocks/responses.js';

export const listTemplatesTool: ToolDefinition = {
  name: 'list_templates',
  description:
    'Discover agency templates scoped per client, branch, or user—including standard, compliance, and anonymized packs such as the bank-ready variants highlighted in FormaCV’s integration pages.',
  inputSchema: listTemplatesInputSchema,
  handler: async (args, ctx) => {
    const validated = listTemplatesInputSchema.parse(args ?? {});
    if (ctx.isDemoMode) {
      return listTemplatesOutputSchema.parse(mockListTemplates(validated));
    }
    const result = await ctx.client.call<ListTemplatesOutputT>('list_templates', validated);
    return listTemplatesOutputSchema.parse(result);
  },
};
