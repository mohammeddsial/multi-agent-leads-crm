const express = require('express');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '..', 'mcp.config.js');
let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = require(configPath);
  } catch (err) {
    console.error('Failed to load config:', err);
  }
}

const port = (config.server && config.server.port) || 3001;

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/config', (req, res) => res.json(config));

app.post('/run', (req, res) => {
  // Placeholder: in a real MCP this would dispatch tasks to agents
  res.json({ received: req.body });
});

app.listen(port, () => console.log(`MCP server listening on ${port}`));
