import type { ToolDefinition } from '../types.js';
import { anonymizeCvInputSchema, anonymizeCvOutputSchema } from '../schemas/anonymize-cv.js';
import type { AnonymizeCvOutputT } from '../schemas/anonymize-cv.js';
import { mockAnonymizeCv } from '../mocks/responses.js';

export const anonymizeCvTool: ToolDefinition = {
  name: 'anonymize_cv',
  description:
    'Strip personally identifying details (name, email, phone, photo, address, company names) for blind client submissions with a structured audit trail—matching FormaCV’s anonymization story on every plan, including compliance-friendly evidence packs.',
  inputSchema: anonymizeCvInputSchema,
  handler: async (args, ctx) => {
    const validated = anonymizeCvInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return anonymizeCvOutputSchema.parse(mockAnonymizeCv(validated));
    }
    const result = await ctx.client.call<AnonymizeCvOutputT>('anonymize_cv', validated);
    return anonymizeCvOutputSchema.parse(result);
  },
};
