import type { ToolDefinition } from '../types.js';
import { tailorCvInputSchema, tailorCvOutputSchema } from '../schemas/tailor-cv.js';
import type { TailorCvOutputT } from '../schemas/tailor-cv.js';
import { mockTailorCv } from '../mocks/responses.js';

export const tailorCvTool: ToolDefinition = {
  name: 'tailor_cv',
  description:
    'Unlimited AI tailoring on every plan: paste the vacancy text, describe how to emphasise matches, translate, or demote noise, and FormaCV returns a tailored CV aligned to that brief while preserving your template system and ATS-safe structure.',
  inputSchema: tailorCvInputSchema,
  handler: async (args, ctx) => {
    const validated = tailorCvInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return tailorCvOutputSchema.parse(mockTailorCv(validated));
    }
    const result = await ctx.client.call<TailorCvOutputT>('tailor_cv', validated);
    return tailorCvOutputSchema.parse(result);
  },
};
