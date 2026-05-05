import type { ToolDefinition } from '../types.js';
import { getJobStatusInputSchema, getJobStatusOutputSchema } from '../schemas/get-job-status.js';
import type { GetJobStatusOutputT } from '../schemas/get-job-status.js';
import { mockGetJobStatus } from '../mocks/responses.js';

export const getJobStatusTool: ToolDefinition = {
  name: 'get_job_status',
  description:
    'Poll asynchronous MCP jobs triggered by formatting, tailoring, anonymization, or bulk batches—surfacing percentage completion plus secure download URLs when processing wraps.',
  inputSchema: getJobStatusInputSchema,
  handler: async (args, ctx) => {
    const validated = getJobStatusInputSchema.parse(args);
    if (ctx.isDemoMode) {
      return getJobStatusOutputSchema.parse(mockGetJobStatus(validated));
    }
    const result = await ctx.client.call<GetJobStatusOutputT>('get_job_status', validated);
    return getJobStatusOutputSchema.parse(result);
  },
};
