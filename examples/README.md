# FormaCV MCP — example client configs

These JSON snippets are **drop-in starters** for wiring [`@formacv/mcp`](https://www.npmjs.com/package/@formacv/mcp) into common AI hosts.

## Files

| File | Where it goes |
|---|---|
| [`claude-desktop-config.json`](claude-desktop-config.json) | Claude Desktop MCP settings (merge under `mcpServers`) |
| [`cursor-mcp.json`](cursor-mcp.json) | Cursor — `~/.cursor/mcp.json` or `<project>/.cursor/mcp.json` |
| [`vscode-copilot-mcp.json`](vscode-copilot-mcp.json) | VS Code — `.vscode/mcp.json` (Copilot Chat with MCP) |

## Demo vs production

- **Demo (no onboarding):** keep `FORMACV_SERVER_URL` set to `https://demo.formacv.ai` and use any placeholder for `FORMACV_API_KEY` (the shipped examples use `"demo"`). You get realistic sample responses for integration testing.
- **Production:** replace with the **API key** and **isolated instance URL** issued by FormaCV after onboarding. Contact [FormaCV](https://formacv.ai/#contact).

Never commit real API keys. Use environment-variable indirection or a secrets manager when sharing configs outside your machine.
