INSERT INTO assets (id, service, environment, owner, exposure, vulnerabilities, criticality) VALUES
  ('A-101', 'identity-admin', 'Production', 'Platform', 'Public', 1, 'Critical'),
  ('A-204', 's3-prod-claims-analytics', 'Production', 'Data', 'Private', 0, 'Critical'),
  ('A-301', 'payments-api-prod', 'Production', 'Payments', 'Public', 3, 'High'),
  ('A-417', 'infra-modules', 'Production', 'DevOps', 'Internal', 2, 'High'),
  ('A-503', 'finance-laptop-22', 'Production', 'Finance', 'Internal', 5, 'Medium');

INSERT INTO incidents
  (id, title, severity, status, source, mitre_technique, asset_id, identity, source_ip, risk_score, first_seen, evidence, recommended_playbook)
VALUES
  (
    'INC-2407',
    'Impossible travel followed by admin console access',
    'Critical',
    'Investigating',
    'Okta',
    'T1078 - Valid Accounts',
    'A-101',
    'mira.chen@company.test',
    '185.220.101.42',
    96,
    now() - interval '76 minutes',
    '["Successful login from New Jersey and Romania within 14 minutes.", "Session requested admin_console:write scope after MFA fatigue sequence.", "IP appears in two historical TOR exit-node reports."]',
    '["Revoke active sessions and rotate refresh tokens.", "Force phishing-resistant MFA reset.", "Search CloudTrail for role assumptions by the same identity."]'
  ),
  (
    'INC-2408',
    'S3 data exfiltration pattern from analytics bucket',
    'High',
    'Open',
    'CloudTrail',
    'T1530 - Data from Cloud Storage',
    'A-204',
    'svc-reporting-prod',
    '44.201.88.19',
    88,
    now() - interval '53 minutes',
    '["GetObject volume is 7.4x the service account baseline.", "Requests target export prefixes not accessed in the last 30 days.", "Egress destination is not in the approved data partner allowlist."]',
    '["Disable service account key and preserve CloudTrail logs.", "Compare object list against approved exports.", "Open legal/privacy review if PHI-tagged objects were accessed."]'
  ),
  (
    'INC-2409',
    'Kubernetes workload spawned suspicious reverse shell',
    'Critical',
    'Contained',
    'Kubernetes',
    'T1059 - Command and Scripting Interpreter',
    'A-301',
    'pod/payments-api-7fd9',
    '10.42.17.88',
    94,
    now() - interval '40 minutes',
    '["Container executed /bin/sh with outbound connection to unknown host.", "Image digest differs from the signed production release.", "Network policy blocked second-stage callback after 37 seconds."]',
    '["Quarantine pod and snapshot container filesystem.", "Verify image provenance against registry signatures.", "Search cluster for same digest and command-line pattern."]'
  ),
  (
    'INC-2410',
    'GitHub deploy key used outside normal automation window',
    'Medium',
    'Open',
    'GitHub',
    'T1098 - Account Manipulation',
    'A-417',
    'deploy-key-prod',
    '198.51.100.44',
    67,
    now() - interval '12 minutes',
    '["Read access from new ASN outside deployment schedule.", "Key touched Terraform modules used by production VPC.", "No matching CI workflow run exists for the access time."]',
    '["Rotate deploy key and validate CI secrets.", "Review repository audit log around access window.", "Run drift detection for production network modules."]'
  );

INSERT INTO playbooks (id, name, trigger, owner, automation_level, steps, integrations) VALUES
  (
    'PB-001',
    'Identity compromise containment',
    'Impossible travel with privileged scope request',
    'Identity Security',
    'Approval required',
    '["Revoke sessions.", "Force password reset.", "Search cloud audit logs.", "Create incident report."]',
    '["Okta", "Slack", "Jira", "CloudTrail"]'
  ),
  (
    'PB-003',
    'Kubernetes workload quarantine',
    'Suspicious shell execution with outbound callback',
    'Platform Security',
    'Auto-contained',
    '["Apply quarantine policy.", "Snapshot filesystem.", "Verify image signature.", "Hunt same digest."]',
    '["Kubernetes", "Falco", "Container Registry", "SIEM"]'
  );

INSERT INTO security_events
  (id, timestamp, source, actor, action, asset_id, ip, country, raw, risk_score)
VALUES
  ('LOG-9001', now() - interval '79 minutes', 'Okta', 'mira.chen', 'MFA push denied', 'A-101', '185.220.101.42', 'RO', '{"factor":"push","result":"denied"}', 78),
  ('LOG-9002', now() - interval '76 minutes', 'Okta', 'mira.chen', 'Admin console login', 'A-101', '185.220.101.42', 'RO', '{"scope":"admin_console:write"}', 96),
  ('LOG-9003', now() - interval '53 minutes', 'CloudTrail', 'svc-reporting-prod', 'S3 GetObject burst', 'A-204', '44.201.88.19', 'US', '{"bucket":"s3-prod-claims-analytics","baseline_multiplier":7.4}', 88),
  ('LOG-9004', now() - interval '40 minutes', 'Kubernetes', 'pod/payments-api', 'Reverse shell blocked', 'A-301', '10.42.17.88', 'internal', '{"process":"/bin/sh","network_policy":"blocked"}', 94),
  ('LOG-9005', now() - interval '27 minutes', 'Defender', 'wrk-1822', 'Credential dump signature', 'A-503', '10.0.9.81', 'internal', '{"signature":"credential_dump"}', 82),
  ('LOG-9006', now() - interval '12 minutes', 'GitHub', 'deploy-key-prod', 'Repo read from new ASN', 'A-417', '198.51.100.44', 'US', '{"workflow_run":false}', 67);

INSERT INTO threat_notes (id, title, source, mitre_tag, confidence, summary) VALUES
  ('TI-001', 'Valid account compromise playbook', 'MITRE ATT&CK', 'MITRE T1078', 'High', 'Correlate impossible travel, MFA fatigue, new ASN, privileged scope requests, and admin-console access.'),
  ('TI-002', 'Cloud storage exfiltration', 'Cloud Advisory', 'MITRE T1530', 'High', 'Baseline object access by prefix, actor, ASN, and export schedule. Prioritize sensitive buckets.'),
  ('TI-003', 'Container command execution', 'Vendor Intel', 'MITRE T1059', 'Medium', 'Link image provenance, exec events, egress attempts, network policy denies, and workload identity.'),
  ('TI-004', 'Deploy key abuse', 'Internal IR', 'MITRE T1098', 'Medium', 'Treat off-hours deploy key access from new ASNs as infrastructure tampering until CI provenance is verified.');

INSERT INTO detection_rules
  (id, name, source, severity, mitre_technique, status, owner, version, last_tuned, test_coverage, false_positive_rate, precision_score, recall_score, rule_logic, signals)
VALUES
  ('DET-101', 'Impossible travel with privileged scope request', 'Okta', 'Critical', 'T1078 - Valid Accounts', 'Production', 'Identity Security', '2.4.1', '2026-05-12', 94, 3.8, 92, 89, 'Group logins by identity and require impossible travel plus privileged scope.', '["geo_velocity","mfa_fatigue","privileged_scope","new_asn"]'),
  ('DET-204', 'S3 export burst outside approved partner allowlist', 'CloudTrail', 'High', 'T1530 - Data from Cloud Storage', 'Production', 'Cloud Security', '1.9.0', '2026-05-10', 88, 5.4, 87, 84, 'Baseline object access by account, prefix, schedule, and destination ASN.', '["s3_getobject_burst","sensitive_prefix","new_destination","service_account"]'),
  ('DET-309', 'Container shell execution with blocked egress', 'Kubernetes', 'Critical', 'T1059 - Command and Scripting Interpreter', 'Production', 'Platform Security', '3.1.2', '2026-05-14', 91, 2.9, 94, 86, 'Correlate shell process, unsigned digest, and network deny.', '["exec_shell","unsigned_digest","network_deny","unknown_egress"]'),
  ('DET-417', 'Deploy key access outside CI provenance', 'GitHub', 'Medium', 'T1098 - Account Manipulation', 'Tuning', 'DevOps Security', '0.8.3', '2026-05-08', 76, 8.1, 78, 81, 'Detect deploy-key access from a new ASN without matching workflow provenance.', '["deploy_key","new_asn","missing_workflow","off_hours"]');

INSERT INTO compliance_controls
  (id, framework, domain, requirement, owner, status, evidence, mapped_incidents)
VALUES
  ('HIPAA-164.312-B', 'HIPAA', 'Audit controls', 'Record and examine activity in systems that contain sensitive health data.', 'Security Operations', 'Passing', '["Normalized cloud, identity, container, source-control, and endpoint logs.", "Playbook executions write audit records."]', '["INC-2407","INC-2408","INC-2409"]'),
  ('HIPAA-164.312-D', 'HIPAA', 'Person or entity authentication', 'Verify identities before access to sensitive systems.', 'Identity Security', 'At risk', '["Impossible-travel detection is active.", "Phishing-resistant MFA reset is required after compromise."]', '["INC-2407"]'),
  ('SOC2-CC7.2', 'SOC 2', 'System monitoring', 'Monitor system components and detect anomalies.', 'Platform Security', 'Passing', '["Detection rules are mapped to MITRE ATT&CK.", "Each rule tracks quality metrics."]', '["INC-2407","INC-2408","INC-2409","INC-2410"]'),
  ('NIST-DE.CM-7', 'NIST CSF', 'Detection processes', 'Monitor for unauthorized personnel, connections, devices, and software.', 'Detection Engineering', 'Needs evidence', '["Container shell and deploy-key detections are active.", "Signed release metadata still needs full coverage."]', '["INC-2409","INC-2410"]');
