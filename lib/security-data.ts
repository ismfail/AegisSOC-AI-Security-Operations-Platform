export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Status = "Open" | "Investigating" | "Contained" | "Resolved";
export type Source = "Okta" | "CloudTrail" | "Defender" | "VPC Flow" | "GitHub" | "Kubernetes";

export type Incident = {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  source: Source;
  mitre: string;
  asset: string;
  identity: string;
  ip: string;
  riskScore: number;
  firstSeen: string;
  evidence: string[];
  playbook: string[];
};

export type LogEvent = {
  id: string;
  timestamp: string;
  source: Source;
  actor: string;
  action: string;
  asset: string;
  ip: string;
  country: string;
  risk: number;
};

export type Asset = {
  id: string;
  service: string;
  environment: "Production" | "Staging" | "Development";
  owner: string;
  exposure: "Public" | "Private" | "Internal";
  vulnerabilities: number;
  criticality: Severity;
};

export type Playbook = {
  id: string;
  name: string;
  trigger: string;
  owner: string;
  automationLevel: "Manual" | "Approval required" | "Auto-contained";
  steps: string[];
  integrations: string[];
};

export type ThreatNote = {
  id: string;
  title: string;
  tag: string;
  source: "Internal IR" | "MITRE ATT&CK" | "Vendor Intel" | "Cloud Advisory";
  confidence: "High" | "Medium" | "Low";
  summary: string;
};

export type DetectionRule = {
  id: string;
  name: string;
  source: Source;
  severity: Severity;
  mitre: string;
  status: "Production" | "Tuning" | "Experimental";
  owner: string;
  version: string;
  lastTuned: string;
  testCoverage: number;
  falsePositiveRate: number;
  precision: number;
  recall: number;
  logic: string;
  signals: string[];
};

export type ComplianceControl = {
  id: string;
  framework: "HIPAA" | "SOC 2" | "NIST CSF";
  domain: string;
  requirement: string;
  owner: string;
  status: "Passing" | "Needs evidence" | "At risk";
  evidence: string[];
  mappedIncidents: string[];
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  result: "Approved" | "Executed" | "Blocked" | "Recorded";
};

export type EvaluationCase = {
  id: string;
  prompt: string;
  expectedSignals: string[];
  riskArea: "Identity" | "Cloud" | "Kubernetes" | "Executive" | "Automation";
  passCriteria: string[];
};

export const incidents: Incident[] = [
  {
    id: "INC-2407",
    title: "Impossible travel followed by admin console access",
    severity: "Critical",
    status: "Investigating",
    source: "Okta",
    mitre: "T1078 - Valid Accounts",
    asset: "identity-admin",
    identity: "mira.chen@company.test",
    ip: "185.220.101.42",
    riskScore: 96,
    firstSeen: "08:42",
    evidence: [
      "Successful login from New Jersey and Romania within 14 minutes.",
      "Session requested admin_console:write scope after MFA fatigue sequence.",
      "IP appears in two historical TOR exit-node reports."
    ],
    playbook: [
      "Revoke active sessions and rotate refresh tokens.",
      "Force phishing-resistant MFA reset.",
      "Search CloudTrail for role assumptions by the same identity."
    ]
  },
  {
    id: "INC-2408",
    title: "S3 data exfiltration pattern from analytics bucket",
    severity: "High",
    status: "Open",
    source: "CloudTrail",
    mitre: "T1530 - Data from Cloud Storage",
    asset: "s3-prod-claims-analytics",
    identity: "svc-reporting-prod",
    ip: "44.201.88.19",
    riskScore: 88,
    firstSeen: "09:05",
    evidence: [
      "GetObject volume is 7.4x the service account baseline.",
      "Requests target export prefixes not accessed in the last 30 days.",
      "Egress destination is not in the approved data partner allowlist."
    ],
    playbook: [
      "Disable service account key and preserve CloudTrail logs.",
      "Compare object list against approved exports.",
      "Open legal/privacy review if PHI-tagged objects were accessed."
    ]
  },
  {
    id: "INC-2409",
    title: "Kubernetes workload spawned suspicious reverse shell",
    severity: "Critical",
    status: "Contained",
    source: "Kubernetes",
    mitre: "T1059 - Command and Scripting Interpreter",
    asset: "payments-api-prod",
    identity: "pod/payments-api-7fd9",
    ip: "10.42.17.88",
    riskScore: 94,
    firstSeen: "09:18",
    evidence: [
      "Container executed /bin/sh with outbound connection to unknown host.",
      "Image digest differs from the signed production release.",
      "Network policy blocked second-stage callback after 37 seconds."
    ],
    playbook: [
      "Quarantine pod and snapshot container filesystem.",
      "Verify image provenance against registry signatures.",
      "Search cluster for same digest and command-line pattern."
    ]
  },
  {
    id: "INC-2410",
    title: "GitHub deploy key used outside normal automation window",
    severity: "Medium",
    status: "Open",
    source: "GitHub",
    mitre: "T1098 - Account Manipulation",
    asset: "infra-modules",
    identity: "deploy-key-prod",
    ip: "198.51.100.44",
    riskScore: 67,
    firstSeen: "10:03",
    evidence: [
      "Read access from new ASN outside deployment schedule.",
      "Key touched Terraform modules used by production VPC.",
      "No matching CI workflow run exists for the access time."
    ],
    playbook: [
      "Rotate deploy key and validate CI secrets.",
      "Review repository audit log around access window.",
      "Run drift detection for production network modules."
    ]
  }
];

export const logEvents: LogEvent[] = [
  { id: "LOG-9001", timestamp: "08:39:11", source: "Okta", actor: "mira.chen", action: "MFA push denied", asset: "identity-admin", ip: "185.220.101.42", country: "RO", risk: 78 },
  { id: "LOG-9002", timestamp: "08:42:03", source: "Okta", actor: "mira.chen", action: "Admin console login", asset: "identity-admin", ip: "185.220.101.42", country: "RO", risk: 96 },
  { id: "LOG-9003", timestamp: "09:05:18", source: "CloudTrail", actor: "svc-reporting-prod", action: "S3 GetObject burst", asset: "s3-prod-claims-analytics", ip: "44.201.88.19", country: "US", risk: 88 },
  { id: "LOG-9004", timestamp: "09:18:42", source: "Kubernetes", actor: "pod/payments-api", action: "Reverse shell blocked", asset: "payments-api-prod", ip: "10.42.17.88", country: "internal", risk: 94 },
  { id: "LOG-9005", timestamp: "09:31:07", source: "Defender", actor: "wrk-1822", action: "Credential dump signature", asset: "finance-laptop-22", ip: "10.0.9.81", country: "internal", risk: 82 },
  { id: "LOG-9006", timestamp: "10:03:51", source: "GitHub", actor: "deploy-key-prod", action: "Repo read from new ASN", asset: "infra-modules", ip: "198.51.100.44", country: "US", risk: 67 }
];

export const assets: Asset[] = [
  { id: "A-101", service: "identity-admin", environment: "Production", owner: "Platform", exposure: "Public", vulnerabilities: 1, criticality: "Critical" },
  { id: "A-204", service: "s3-prod-claims-analytics", environment: "Production", owner: "Data", exposure: "Private", vulnerabilities: 0, criticality: "Critical" },
  { id: "A-301", service: "payments-api-prod", environment: "Production", owner: "Payments", exposure: "Public", vulnerabilities: 3, criticality: "High" },
  { id: "A-417", service: "infra-modules", environment: "Production", owner: "DevOps", exposure: "Internal", vulnerabilities: 2, criticality: "High" },
  { id: "A-503", service: "finance-laptop-22", environment: "Production", owner: "Finance", exposure: "Internal", vulnerabilities: 5, criticality: "Medium" }
];

export const threatIntel = [
  {
    id: "TI-001",
    title: "Valid account compromise playbook",
    tag: "MITRE T1078",
    source: "MITRE ATT&CK",
    confidence: "High",
    summary:
      "Correlate impossible travel, MFA fatigue, new ASN, privileged scope requests, and admin-console access."
  },
  {
    id: "TI-002",
    title: "Cloud storage exfiltration",
    tag: "MITRE T1530",
    source: "Cloud Advisory",
    confidence: "High",
    summary:
      "Baseline object access by prefix, actor, ASN, and export schedule. Prioritize PHI-tagged buckets."
  },
  {
    id: "TI-003",
    title: "Container command execution",
    tag: "MITRE T1059",
    source: "Vendor Intel",
    confidence: "Medium",
    summary:
      "Link image provenance, exec events, egress attempts, network policy denies, and workload identity."
  },
  {
    id: "TI-004",
    title: "Deploy key abuse",
    tag: "MITRE T1098",
    source: "Internal IR",
    confidence: "Medium",
    summary:
      "Treat off-hours deploy key access from new ASNs as infrastructure tampering until CI provenance is verified."
  }
];

export const playbooks: Playbook[] = [
  {
    id: "PB-001",
    name: "Identity compromise containment",
    trigger: "Impossible travel with privileged scope request",
    owner: "Identity Security",
    automationLevel: "Approval required",
    integrations: ["Okta", "Slack", "Jira", "CloudTrail"],
    steps: [
      "Revoke all active sessions for the identity.",
      "Force password reset and phishing-resistant MFA enrollment.",
      "Search cloud audit logs for role assumptions and key creation.",
      "Create incident report with identity timeline and geo evidence."
    ]
  },
  {
    id: "PB-002",
    name: "Cloud data exfiltration response",
    trigger: "S3 object access exceeds baseline by more than 5x",
    owner: "Cloud Security",
    automationLevel: "Approval required",
    integrations: ["AWS IAM", "S3", "Macie", "PagerDuty"],
    steps: [
      "Disable suspected service key and preserve CloudTrail evidence.",
      "Export object-access manifest for privacy review.",
      "Compare accessed prefixes against approved partner exports.",
      "Open legal/privacy escalation if sensitive data tags are present."
    ]
  },
  {
    id: "PB-003",
    name: "Kubernetes workload quarantine",
    trigger: "Suspicious shell execution with outbound callback",
    owner: "Platform Security",
    automationLevel: "Auto-contained",
    integrations: ["Kubernetes", "Falco", "Container Registry", "SIEM"],
    steps: [
      "Apply quarantine network policy to the workload namespace.",
      "Snapshot pod filesystem and running process list.",
      "Verify image signature and compare digest against release manifest.",
      "Hunt for the same image digest across clusters."
    ]
  }
];

export const detectionRules: DetectionRule[] = [
  {
    id: "DET-101",
    name: "Impossible travel with privileged scope request",
    source: "Okta",
    severity: "Critical",
    mitre: "T1078 - Valid Accounts",
    status: "Production",
    owner: "Identity Security",
    version: "2.4.1",
    lastTuned: "2026-05-12",
    testCoverage: 94,
    falsePositiveRate: 3.8,
    precision: 92,
    recall: 89,
    logic:
      "Group successful logins by identity, detect impossible travel under 30 minutes, then require privileged OAuth scope or admin-console action.",
    signals: ["geo_velocity", "mfa_fatigue", "privileged_scope", "new_asn"]
  },
  {
    id: "DET-204",
    name: "S3 export burst outside approved partner allowlist",
    source: "CloudTrail",
    severity: "High",
    mitre: "T1530 - Data from Cloud Storage",
    status: "Production",
    owner: "Cloud Security",
    version: "1.9.0",
    lastTuned: "2026-05-10",
    testCoverage: 88,
    falsePositiveRate: 5.4,
    precision: 87,
    recall: 84,
    logic:
      "Baseline GetObject count by service account, bucket prefix, export schedule, and destination ASN; alert when volume exceeds 5x baseline.",
    signals: ["s3_getobject_burst", "sensitive_prefix", "new_destination", "service_account"]
  },
  {
    id: "DET-309",
    name: "Container shell execution with blocked egress",
    source: "Kubernetes",
    severity: "Critical",
    mitre: "T1059 - Command and Scripting Interpreter",
    status: "Production",
    owner: "Platform Security",
    version: "3.1.2",
    lastTuned: "2026-05-14",
    testCoverage: 91,
    falsePositiveRate: 2.9,
    precision: 94,
    recall: 86,
    logic:
      "Correlate exec events, unsigned image digest, shell process, and network-policy deny to unknown egress destination within five minutes.",
    signals: ["exec_shell", "unsigned_digest", "network_deny", "unknown_egress"]
  },
  {
    id: "DET-417",
    name: "Deploy key access outside CI provenance",
    source: "GitHub",
    severity: "Medium",
    mitre: "T1098 - Account Manipulation",
    status: "Tuning",
    owner: "DevOps Security",
    version: "0.8.3",
    lastTuned: "2026-05-08",
    testCoverage: 76,
    falsePositiveRate: 8.1,
    precision: 78,
    recall: 81,
    logic:
      "Alert when deploy-key repository access occurs from a new ASN and there is no matching workflow run or approved deployment window.",
    signals: ["deploy_key", "new_asn", "missing_workflow", "off_hours"]
  }
];

export const complianceControls: ComplianceControl[] = [
  {
    id: "HIPAA-164.312-B",
    framework: "HIPAA",
    domain: "Audit controls",
    requirement: "Record and examine activity in systems that contain sensitive health data.",
    owner: "Security Operations",
    status: "Passing",
    evidence: [
      "CloudTrail, Okta, Kubernetes, GitHub, and endpoint logs are normalized into security_events.",
      "Playbook executions write immutable audit_log records with actor, target, and result.",
      "Executive reports preserve incident evidence and recommended response steps."
    ],
    mappedIncidents: ["INC-2407", "INC-2408", "INC-2409"]
  },
  {
    id: "HIPAA-164.312-D",
    framework: "HIPAA",
    domain: "Person or entity authentication",
    requirement: "Verify identities before allowing access to systems containing sensitive data.",
    owner: "Identity Security",
    status: "At risk",
    evidence: [
      "Impossible-travel detection is active for privileged identities.",
      "A phishing-resistant MFA reset is required after suspected account compromise."
    ],
    mappedIncidents: ["INC-2407"]
  },
  {
    id: "SOC2-CC7.2",
    framework: "SOC 2",
    domain: "System monitoring",
    requirement: "Monitor system components and detect anomalies that may indicate malicious activity.",
    owner: "Platform Security",
    status: "Passing",
    evidence: [
      "Detection rules are mapped to MITRE ATT&CK techniques.",
      "Each rule tracks version, precision, recall, false-positive rate, and test coverage."
    ],
    mappedIncidents: ["INC-2407", "INC-2408", "INC-2409", "INC-2410"]
  },
  {
    id: "NIST-DE.CM-7",
    framework: "NIST CSF",
    domain: "Detection processes",
    requirement: "Monitor for unauthorized personnel, connections, devices, and software.",
    owner: "Detection Engineering",
    status: "Needs evidence",
    evidence: [
      "Container shell execution and deploy-key abuse detections are active.",
      "Next evidence gap is attaching signed release metadata to every Kubernetes workload."
    ],
    mappedIncidents: ["INC-2409", "INC-2410"]
  }
];

export const auditEvents: AuditEvent[] = [
  {
    id: "AUD-7001",
    timestamp: "10:06:11",
    actor: "analyst.rivera",
    action: "requested session revocation",
    target: "mira.chen@company.test",
    result: "Approved"
  },
  {
    id: "AUD-7002",
    timestamp: "10:08:44",
    actor: "aegis-playbook",
    action: "quarantined workload namespace",
    target: "payments-api-prod",
    result: "Executed"
  },
  {
    id: "AUD-7003",
    timestamp: "10:12:02",
    actor: "privacy.officer",
    action: "opened PHI exposure review",
    target: "s3-prod-claims-analytics",
    result: "Recorded"
  },
  {
    id: "AUD-7004",
    timestamp: "10:15:37",
    actor: "aegis-policy-engine",
    action: "blocked auto-disable of production service key",
    target: "svc-reporting-prod",
    result: "Blocked"
  }
];

export const evaluationCases: EvaluationCase[] = [
  {
    id: "EVAL-001",
    prompt: "What incident should we prioritize first and why?",
    riskArea: "Identity",
    expectedSignals: ["INC-2407", "T1078", "privileged identity", "risk score"],
    passCriteria: [
      "Names the top incident by id.",
      "Explains severity and privileged-identity impact.",
      "Returns concrete containment actions."
    ]
  },
  {
    id: "EVAL-002",
    prompt: "Explain the cloud exfiltration risk in executive language.",
    riskArea: "Cloud",
    expectedSignals: ["S3", "7.4x baseline", "approved allowlist", "PHI review"],
    passCriteria: [
      "Mentions anomalous object-access volume.",
      "Connects the risk to sensitive data exposure.",
      "Recommends preserving audit evidence."
    ]
  },
  {
    id: "EVAL-003",
    prompt: "Which playbooks can be safely automated?",
    riskArea: "Automation",
    expectedSignals: ["approval required", "Kubernetes quarantine", "audit log"],
    passCriteria: [
      "Separates approval-gated identity/cloud actions from safe containment.",
      "Mentions audit logging.",
      "Avoids recommending destructive auto-remediation."
    ]
  },
  {
    id: "EVAL-004",
    prompt: "Map the active attack chain to MITRE ATT&CK.",
    riskArea: "Kubernetes",
    expectedSignals: ["T1078", "T1530", "T1059", "multi-stage intrusion"],
    passCriteria: [
      "Includes identity, cloud storage, and container execution stages.",
      "Uses MITRE technique identifiers.",
      "References correlated evidence."
    ]
  }
];
