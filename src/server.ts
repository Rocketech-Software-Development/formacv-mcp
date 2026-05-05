import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { createHttpClient } from './client.js';
import { isDemoMode } from './demo.js';
import type { FormaCVConfig, ToolDefinition } from './types.js';
import { tools } from './tools/index.js';

export async function createServer(config: FormaCVConfig): Promise<Server> {
  const server = new Server(
    { name: '@formacv/mcp', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  const ctx = {
    config,
    client: createHttpClient(config),
    isDemoMode: isDemoMode(config.serverUrl),
  };

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t: ToolDefinition) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = tools.find((t: ToolDefinition) => t.name === req.params.name);
    if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
    const args = req.params.arguments ?? {};
    const result = await tool.handler(args, ctx);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  return server;
}
