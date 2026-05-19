# 4-8 Week Build Plan

This is the realistic build plan for turning the portfolio implementation into a full production-grade project.

## Week 1: Core Product and Data Model

- Define source event formats for Okta, CloudTrail, GitHub, Kubernetes, and endpoint alerts
- Build PostgreSQL schema and seed data
- Build core Next.js dashboard
- Build incident queue, timeline, and asset graph

## Week 2: Backend APIs and Detection

- Build FastAPI ingestion endpoints
- Add anomaly scoring and correlation rules
- Store scored events and generated incidents
- Add versioned detection rules with precision, recall, test coverage, and false-positive tracking
- Add API tests for scoring and incident generation

## Week 3: RAG and Threat Intelligence

- Add threat-note ingestion
- Generate embeddings
- Store vectors in pgvector
- Add retrieval API
- Ground AI analyst responses in retrieved evidence

## Week 4: Playbooks and Auditability

- Add playbook execution model
- Add approval gates
- Add immutable audit log
- Add simulated integrations for Okta, AWS IAM, Kubernetes, Jira, and Slack
- Add incident workbench with evidence graph, blast-radius analysis, and analyst handoff notes

## Week 5: Auth, RBAC, and Security Controls

- Add login and role-based views
- Add analyst, incident commander, executive, and admin roles
- Add action authorization checks
- Add security headers and input validation
- Add HIPAA, SOC 2, and NIST CSF evidence mapping

## Week 6: Reporting and Deployment

- Add executive report generation
- Add PDF/Markdown export
- Add STIX-style threat-intelligence export
- Add AI analyst regression evaluation dashboard
- Add Docker Compose environment
- Deploy web and API
- Add monitoring and CI checks

## Week 7-8: Polish and Realism

- Add tests and fixtures
- Add more attack scenarios
- Add replayable demo data
- Add screenshots and demo video
- Add architecture diagrams and design notes

## Honest Portfolio Framing

The repository is a portfolio implementation of the full architecture. It uses simulated telemetry and deterministic AI responses to avoid using real customer security data or destructive integrations.
