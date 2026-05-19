CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('analyst', 'incident_commander', 'admin', 'executive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  environment TEXT NOT NULL,
  owner TEXT NOT NULL,
  exposure TEXT NOT NULL,
  vulnerabilities INTEGER NOT NULL DEFAULT 0,
  criticality TEXT NOT NULL
);

CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  asset_id TEXT REFERENCES assets(id),
  ip INET,
  country TEXT,
  raw JSONB NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  status TEXT NOT NULL CHECK (status IN ('Open', 'Investigating', 'Contained', 'Resolved')),
  source TEXT NOT NULL,
  mitre_technique TEXT NOT NULL,
  asset_id TEXT REFERENCES assets(id),
  identity TEXT NOT NULL,
  source_ip INET,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  first_seen TIMESTAMPTZ NOT NULL,
  evidence JSONB NOT NULL,
  recommended_playbook JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE threat_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  mitre_tag TEXT NOT NULL,
  confidence TEXT NOT NULL,
  summary TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE playbooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  owner TEXT NOT NULL,
  automation_level TEXT NOT NULL,
  steps JSONB NOT NULL,
  integrations JSONB NOT NULL
);

CREATE TABLE detection_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  severity TEXT NOT NULL,
  mitre_technique TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Production', 'Tuning', 'Experimental')),
  owner TEXT NOT NULL,
  version TEXT NOT NULL,
  last_tuned DATE NOT NULL,
  test_coverage NUMERIC(5, 2) NOT NULL,
  false_positive_rate NUMERIC(5, 2) NOT NULL,
  precision_score NUMERIC(5, 2) NOT NULL,
  recall_score NUMERIC(5, 2) NOT NULL,
  rule_logic TEXT NOT NULL,
  signals JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compliance_controls (
  id TEXT PRIMARY KEY,
  framework TEXT NOT NULL,
  domain TEXT NOT NULL,
  requirement TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Passing', 'Needs evidence', 'At risk')),
  evidence JSONB NOT NULL,
  mapped_incidents JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_eval_cases (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  risk_area TEXT NOT NULL,
  expected_signals JSONB NOT NULL,
  pass_criteria JSONB NOT NULL,
  last_score INTEGER CHECK (last_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incident_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL REFERENCES incidents(id),
  source_entity TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  relationship TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE playbook_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id TEXT NOT NULL REFERENCES playbooks(id),
  incident_id TEXT NOT NULL REFERENCES incidents(id),
  approved_by UUID REFERENCES users(id),
  status TEXT NOT NULL,
  executed_steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_risk ON security_events (risk_score DESC);
CREATE INDEX idx_security_events_source_time ON security_events (source, timestamp DESC);
CREATE INDEX idx_incidents_status_severity ON incidents (status, severity);
CREATE INDEX idx_threat_notes_embedding ON threat_notes USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_detection_rules_mitre ON detection_rules (mitre_technique);
CREATE INDEX idx_compliance_controls_status ON compliance_controls (framework, status);
CREATE INDEX idx_incident_edges_incident ON incident_edges (incident_id);
