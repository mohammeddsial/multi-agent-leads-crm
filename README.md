# multi-agent-leads-crm

This repository includes a minimal MCP server scaffold in `mcp-server/`, plus a self-hosted n8n stack with three lead-sourcing agent workflows.

## n8n Lead-Gen Stack

### 1. Bring up the stack

```powershell
docker compose up -d
```

This starts `n8n-postgres`, `n8n` (UI at http://localhost:5678), and `mcp-server`. n8n reads `N8N_ENCRYPTION_KEY` from `.env` (not committed — generate your own with the snippet below if it doesn't exist):

```powershell
[System.BitConverter]::ToString((New-Object byte[] 32 | ForEach-Object { (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($_); $_ })).Replace('-','').ToLower()
```

### 2. Create the Gemini API credential

In n8n: **Settings → Credentials → Add Credential → Header Auth**

- **Name:** `Gemini API` (must match exactly — the workflows reference it by this name)
- **Header Name:** `x-goog-api-key`
- **Header Value:** your free API key from [Google AI Studio](https://aistudio.google.com)

### 3. Import the agent workflows

For each file in `workflows/`:

1. **Workflows → Add workflow → ⋯ menu → Import from File** (or paste the JSON via Import from Clipboard).
2. Click the **"Gemini Qualify & Personalize"** node and select the **Gemini API** credential (it will show a warning until you do).
3. Click the **"Post to Webhook"** node and replace `https://webhook.site/your-unique-url` with a real destination — get a free test URL from [webhook.site](https://webhook.site), or point it at a Slack incoming webhook / Notion automation later.
4. Click **Test Workflow** to run it once manually, then toggle **Active** to enable the schedule.

| File | Source | Schedule | Targets |
|---|---|---|---|
| `workflows/agent1-shersial-producthunt.json` | Product Hunt RSS feed | every 6 hours | shersial.com (premium Webflow/design redesigns) |
| `workflows/agent2-getdesign-reddit.json` | Reddit (r/saas, r/smallbusiness, r/startups) | every hour | getdesign.io (productized design subscriptions) |
| `workflows/agent3-waraqlabs-upwork.json` | Upwork jobs RSS feed | every 3 hours | waraqlabs.com (custom mobile/web dev, tech-debt fixes) |

Each workflow follows the same pipeline: **fetch → deduplicate (persisted to a JSON file in the n8n data volume) → Gemini qualification & personalization → filter qualified leads → POST to webhook**.

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
