# multi-agent-leads-crm

This repository includes a minimal MCP server scaffold in `mcp-server/`.

## Quick start (no Docker required)

1. Install dependencies:
   ```powershell
   npm run mcp:install
   ```
2. Start the MCP server:
   ```powershell
   npm run mcp:start
   ```
3. Verify the API:
   ```powershell
   npm run mcp:health
   ```

## Alternative Docker startup

If Docker is installed later, run:
```powershell
docker compose up -d mcp-server
```

## Files

- `mcp.config.js` — minimal MCP configuration
- `mcp-server/` — Express-based placeholder MCP server
- `.vscode/tasks.json` — VS Code tasks for install/start
- `docker-compose.yml` — includes `mcp-server` service
