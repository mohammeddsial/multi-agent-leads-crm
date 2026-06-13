const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

// Postgres connection (reads standard PG* env vars passed in via docker-compose).
const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'n8n',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'n8n',
});

const VALID_STATUSES = ['new', 'contacted', 'replied', 'won', 'lost'];

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/config', (req, res) => res.json(config));

app.post('/run', (req, res) => {
  // Placeholder: in a real MCP this would dispatch tasks to agents
  res.json({ received: req.body });
});

// --- Lead CRM dashboard API ---

// All leads (optionally filtered by agent/status), newest first.
app.get('/api/leads', async (req, res) => {
  try {
    const clauses = [];
    const params = [];
    if (req.query.agent) { params.push(req.query.agent); clauses.push(`agent = $${params.length}`); }
    if (req.query.status) { params.push(req.query.status); clauses.push(`status = $${params.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT id, agent, score, company_name, platform, pain_point, personalized_audit,
              suggested_subject, source_url, status, created_at
         FROM leads ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summary counts grouped by agent and status.
app.get('/api/summary', async (req, res) => {
  try {
    const byStatus = await pool.query(`SELECT status, count(*)::int AS n FROM leads GROUP BY status`);
    const byAgent = await pool.query(`SELECT agent, count(*)::int AS n FROM leads GROUP BY agent ORDER BY n DESC`);
    const total = await pool.query(`SELECT count(*)::int AS n FROM leads`);
    res.json({
      total: total.rows[0].n,
      byStatus: Object.fromEntries(byStatus.rows.map(r => [r.status, r.n])),
      byAgent: byAgent.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a lead's status from the dashboard.
app.post('/api/leads/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE leads SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard HTML.
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => {
  res.type('html').send(fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8'));
});

app.listen(port, () => console.log(`MCP server + dashboard listening on ${port}`));
