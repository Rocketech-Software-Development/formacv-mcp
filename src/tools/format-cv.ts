import type { ToolDefinition } from '../types.js';
import { formatCvInputSchema, formatCvOutputSchema } from '../schemas/format-cv.js';
import type { FormatCvOutputT } from '../schemas/format-cv.js';
import { mockFormatCv } from '../mocks/responses.js';

export const formatCvTool: ToolDefinition = {
  name: 'format_cv',
  description:
    'Turn any candidate CV into a client-ready PDF or DOCX in your agency-branded template—inline inside Bullhorn, JobAdder, or Vincere, or orchestrated via MCP alongside AI agents. Mirrors FormaCV’s promise: ATS-safe typography, compliant variants for regulated clients, branded output landing back on the ATS record typically in under 60 seconds.',
  inputSchema: formatCvInputSchema,
  handler: async (args, ctx) => {
    const validated = formatCvInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return formatCvOutputSchema.parse(mockFormatCv(validated));
    }
    const result = await ctx.client.call<FormatCvOutputT>('format_cv', validated);
    return formatCvOutputSchema.parse(result);
  },
};
