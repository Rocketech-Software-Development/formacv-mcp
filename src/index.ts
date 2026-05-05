#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { loadConfig } from './config.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const server = await createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[FormaCV MCP] connected via stdio');
}

main().catch((err) => {
  console.error('[FormaCV MCP] fatal:', err);
  process.exit(1);
});
