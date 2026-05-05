import { formatCvTool } from './format-cv.js';
import { tailorCvTool } from './tailor-cv.js';
import { anonymizeCvTool } from './anonymize-cv.js';
import { pushToAtsTool } from './push-to-ats.js';
import { bulkFormatTool } from './bulk-format.js';
import { listTemplatesTool } from './list-templates.js';
import { listIntegrationsTool } from './list-integrations.js';
import { getJobStatusTool } from './get-job-status.js';
import type { ToolDefinition } from '../types.js';

export const tools: ToolDefinition[] = [
  formatCvTool,
  tailorCvTool,
  anonymizeCvTool,
  pushToAtsTool,
  bulkFormatTool,
  listTemplatesTool,
  listIntegrationsTool,
  getJobStatusTool,
];
