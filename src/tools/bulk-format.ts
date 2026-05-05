import type { ToolDefinition } from '../types.js';
import { bulkFormatInputSchema, bulkFormatOutputSchema } from '../schemas/bulk-format.js';
import type { BulkFormatOutputT } from '../schemas/bulk-format.js';
import { mockBulkFormat } from '../mocks/responses.js';

export const bulkFormatTool: ToolDefinition = {
  name: 'bulk_format',
  description:
    'Queue up dozens of cached CV identifiers (mirroring Bullhorn/JobAdder/Vincere search-result batches) for parallel formatting against a single branded template—with optional ATS-safe typography and multilingual coverage.',
  inputSchema: bulkFormatInputSchema,
  handler: async (args, ctx) => {
    const validated = bulkFormatInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return bulkFormatOutputSchema.parse(mockBulkFormat(validated));
    }
    const result = await ctx.client.call<BulkFormatOutputT>('bulk_format', validated);
    return bulkFormatOutputSchema.parse(result);
  },
};
