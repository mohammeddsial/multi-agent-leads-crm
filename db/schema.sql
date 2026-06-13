-- Persistent CRM table for qualified leads from all lead-gen agents.
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  score INTEGER,
  company_name TEXT,
  platform TEXT,
  pain_point TEXT,
  personalized_audit TEXT,
  suggested_subject TEXT,
  source_url TEXT NOT NULL,
  -- Outreach pipeline status: new -> contacted -> replied -> won / lost
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_url, agent)
);
