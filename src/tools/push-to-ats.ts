import type { ToolDefinition } from '../types.js';
import { pushToAtsInputSchema, pushToAtsOutputSchema } from '../schemas/push-to-ats.js';
import type { PushToAtsOutputT } from '../schemas/push-to-ats.js';
import { mockPushToAts } from '../mocks/responses.js';

export const pushToAtsTool: ToolDefinition = {
  name: 'push_to_ats',
  description:
    'Push a formatted FormaCV document back onto Bullhorn, JobAdder, or Vincere—replacing stale CVs or attaching a fresh branded file alongside existing documents. Reflects native FormaCV integrations that keep recruiters inside their ATS workflows.',
  inputSchema: pushToAtsInputSchema,
  handler: async (args, ctx) => {
    const validated = pushToAtsInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return pushToAtsOutputSchema.parse(mockPushToAts(validated));
    }
    const result = await ctx.client.call<PushToAtsOutputT>('push_to_ats', validated);
    return pushToAtsOutputSchema.parse(result);
  },
};
