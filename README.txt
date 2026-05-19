AegisSOC: AI Security Operations and Threat Intelligence Platform

AegisSOC is a full-stack AI-native Security Operations Center platform. It is built as an internal operations product for security teams that need to ingest telemetry, detect attacks, prioritize incidents, map activity to MITRE ATT&CK, explain risk, coordinate response playbooks, and produce audit-ready evidence.

The application models a serious enterprise SOC workflow end to end. It combines a Next.js command center, incident investigation workbench, AI analyst panel, detection engineering lab, compliance evidence center, PostgreSQL/pgvector schema, FastAPI anomaly scoring service, Docker services, and export APIs for threat intelligence and detection rules.

Core platform capabilities

- SOC command dashboard with incident queue, KPIs, anomaly stream, attack timeline, critical asset graph, telemetry table, playbook overview, and threat-intelligence index
- AI analyst panel that answers operational security questions with evidence, recommended actions, and retrieved threat-intelligence context
- Static incident workbench pages for each active incident, including narrative, evidence list, matched detections, related telemetry, graph nodes, blast-radius analysis, and handoff actions
- Detection engineering lab with versioned detection rules, MITRE ATT&CK mapping, owner, status, tuning date, precision, recall, false-positive rate, test coverage, and expected signals
- AI analyst regression evaluation suite with prompt cases, expected signals, pass criteria, pass/fail status, and aggregate scoring
- Compliance and audit center mapping incident response evidence to HIPAA, SOC 2, and NIST CSF controls
- Approval-aware playbook automation model for identity compromise, cloud exfiltration, and Kubernetes workload quarantine
- STIX-style threat-intelligence export API
- Detection-pack export API that emits Sigma-style rule objects, Microsoft Sentinel KQL, and PostgreSQL hunting queries
- PostgreSQL schema for users, roles, assets, security events, incidents, threat notes, vector embeddings, detection rules, compliance controls, AI eval cases, incident graph edges, playbooks, playbook executions, and audit logs
- FastAPI scoring service that accepts security event features and returns severity, risk score, MITRE mapping, explanation, and recommended playbook steps
- Docker Compose stack for the Next.js web app, FastAPI service, and pgvector-enabled PostgreSQL
- GitHub Actions CI for the web build and Python API validation

Security scenarios modeled

- Impossible travel followed by privileged admin console access
- Cloud storage exfiltration from a sensitive analytics bucket
- Kubernetes workload spawning a suspicious reverse shell
- GitHub deploy key access outside normal automation windows
- Endpoint credential-dump signal inside the current telemetry window

Main app routes

- / - SOC command dashboard and AI analyst panel
- /incidents/INC-2407 - identity compromise incident workbench
- /incidents/INC-2408 - cloud exfiltration incident workbench
- /incidents/INC-2409 - Kubernetes reverse-shell incident workbench
- /incidents/INC-2410 - deploy-key abuse incident workbench
- /detections - detection engineering lab and AI evaluation harness
- /compliance - compliance evidence and audit center

API routes

- GET /api/incidents
- POST /api/analyst
- GET /api/correlation?incidentId=INC-2407
- GET /api/evals
- GET /api/report
- GET /api/stix
- GET /api/detections/export
- POST /api/playbooks/execute
- POST /score on the FastAPI service

Technology stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- lucide-react
- Python
- FastAPI
- scikit-learn
- PostgreSQL
- pgvector
- Docker
- Docker Compose
- REST APIs
- RAG-style retrieval architecture
- MITRE ATT&CK mapping
- SIEM-style analytics
- STIX-style export
- Sigma/KQL/SQL detection export
- GitHub Actions CI

Run locally

1. Install dependencies:

   npm install

2. Start the Next.js app:

   npm run dev

3. Open:

   http://localhost:3000

Run the FastAPI service

1. Enter the API folder:

   cd services/api

2. Create and activate a virtual environment:

   python -m venv .venv
   source .venv/bin/activate

3. Install backend dependencies:

   pip install -r requirements.txt

4. Start the API:

   uvicorn main:app --reload

Run the full Docker stack

   docker compose up --build

Validation

   npm test
   npm run build
   python3 -m py_compile services/api/main.py

Project architecture

Security sources flow into an ingestion and detection layer. Events are scored and correlated into incidents. Incidents are connected to identities, assets, MITRE techniques, detection rules, playbooks, audit events, and compliance controls. The AI analyst layer retrieves the relevant context and returns structured answers with evidence and actions. The dashboard, workbench, detection lab, and compliance center expose those workflows as an internal security operations product.

This project intentionally uses simulated telemetry and deterministic AI analyst responses so it can run locally without real customer data, production credentials, paid threat-intelligence feeds, or destructive security integrations.
