import {
  assets,
  incidents,
  logEvents,
  playbooks,
  threatIntel,
  type Incident,
  type Severity
} from "@/lib/security-data";

const severityWeight: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export function getSocSnapshot() {
  const openIncidents = incidents.filter((incident) => incident.status !== "Resolved");
  const criticalAssets = assets.filter((asset) => asset.criticality === "Critical");
  const averageRisk =
    incidents.reduce((total, incident) => total + incident.riskScore, 0) / incidents.length;
  const highRiskLogs = logEvents.filter((event) => event.risk >= 80);

  return {
    openIncidents: openIncidents.length,
    criticalIncidents: incidents.filter((incident) => incident.severity === "Critical").length,
    averageRisk: Math.round(averageRisk),
    highRiskLogs: highRiskLogs.length,
    vulnerableAssets: assets.reduce((total, asset) => total + asset.vulnerabilities, 0),
    criticalAssets: criticalAssets.length
  };
}

export function rankIncidents(rows: Incident[] = incidents) {
  return [...rows].sort((a, b) => {
    const severityDelta = severityWeight[b.severity] - severityWeight[a.severity];
    return severityDelta || b.riskScore - a.riskScore;
  });
}

export function getMitreCoverage() {
  return incidents.map((incident) => ({
    technique: incident.mitre,
    incidentId: incident.id,
    severity: incident.severity,
    riskScore: incident.riskScore,
    asset: incident.asset
  }));
}

export function getAttackTimeline() {
  return rankIncidents().map((incident, index) => ({
    step: index + 1,
    time: incident.firstSeen,
    incidentId: incident.id,
    title: incident.title,
    technique: incident.mitre,
    riskScore: incident.riskScore
  }));
}

export function getAnomalyScores() {
  return logEvents.map((event) => ({
    ...event,
    label:
      event.risk >= 90
        ? "Critical anomaly"
        : event.risk >= 80
          ? "High anomaly"
          : event.risk >= 65
            ? "Watch"
            : "Baseline"
  }));
}

export function retrieveThreatContext(question: string) {
  const normalized = question.toLowerCase();
  return threatIntel.filter((note) => {
    return (
      normalized.includes(note.tag.toLowerCase().split(" ")[1] ?? "") ||
      normalized.includes("attack") ||
      normalized.includes("mitre") ||
      normalized.includes("exfil") ||
      normalized.includes("cloud") ||
      normalized.includes("identity")
    );
  });
}

export function buildAnalystAnswer(question: string) {
  const normalized = question.toLowerCase();
  const topIncident = rankIncidents()[0];
  const context = retrieveThreatContext(question);

  if (normalized.includes("priority") || normalized.includes("first")) {
    return {
      answer: `${topIncident.id} should be handled first: ${topIncident.title}. It has ${topIncident.severity.toLowerCase()} severity, a ${topIncident.riskScore}/100 risk score, privileged identity impact, and multiple correlated evidence points.`,
      evidence: topIncident.evidence,
      actions: topIncident.playbook,
      retrievedContext: context
    };
  }

  if (normalized.includes("attack") || normalized.includes("mitre")) {
    return {
      answer:
        "The active pattern is a multi-stage intrusion: valid account compromise, cloud-storage collection, and attempted container command execution. The strongest MITRE matches are T1078, T1530, and T1059.",
      evidence: [
        "Okta impossible-travel login requested admin_console:write scope.",
        "CloudTrail shows abnormal S3 GetObject volume from the reporting service account.",
        "Kubernetes blocked reverse-shell egress from a production payment workload."
      ],
      actions: [
        "Revoke sessions and service keys connected to the chain.",
        "Preserve CloudTrail, Okta, and Kubernetes audit logs.",
        "Build an incident timeline around actor, IP, asset, and ATT&CK technique."
      ],
      retrievedContext: context.length ? context : threatIntel
    };
  }

  if (normalized.includes("cloud") || normalized.includes("s3") || normalized.includes("exfil")) {
    const incident = incidents.find((item) => item.id === "INC-2408") ?? topIncident;
    return {
      answer:
        "The cloud exfiltration risk is concentrated in the analytics S3 bucket. The service account is pulling unusual prefixes at 7.4x baseline volume from a destination outside the approved partner allowlist.",
      evidence: incident.evidence,
      actions: incident.playbook,
      retrievedContext: context
    };
  }

  if (normalized.includes("playbook") || normalized.includes("automate")) {
    return {
      answer:
        "The highest-value automation is identity containment with human approval, followed by Kubernetes auto-quarantine. Full auto-remediation is limited to workload isolation because identity and cloud-key revocation can disrupt production.",
      evidence: playbooks.map(
        (playbook) =>
          `${playbook.name}: ${playbook.automationLevel}, owner ${playbook.owner}, trigger ${playbook.trigger}.`
      ),
      actions: [
        "Require approval for user/session revocation.",
        "Allow automatic namespace quarantine for confirmed reverse-shell indicators.",
        "Write every playbook execution to the audit log."
      ],
      retrievedContext: context
    };
  }

  return {
    answer:
      "Current SOC posture is elevated. Prioritize the impossible-travel admin login, the S3 exfiltration pattern, and the suspicious Kubernetes reverse shell because they touch identity, data, and production compute.",
    evidence: [
      `${getSocSnapshot().criticalIncidents} critical incidents are active.`,
      `${getSocSnapshot().highRiskLogs} high-risk log events are in the current window.`,
      `${getSocSnapshot().vulnerableAssets} open vulnerabilities exist across tracked assets.`
    ],
    actions: [
      "Contain compromised identities and service keys.",
      "Snapshot evidence before cleanup.",
      "Generate an executive incident report after triage."
    ],
    retrievedContext: context
  };
}

export function generateExecutiveReport() {
  const snapshot = getSocSnapshot();
  const topThree = rankIncidents().slice(0, 3);

  return {
    title: "Executive SOC Brief",
    summary: `Current risk is elevated with ${snapshot.openIncidents} open incidents, ${snapshot.criticalIncidents} critical incidents, and an average risk score of ${snapshot.averageRisk}/100.`,
    topIncidents: topThree.map((incident) => ({
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      mitre: incident.mitre,
      recommendedAction: incident.playbook[0]
    })),
    businessRisk:
      "Identity compromise and cloud-storage access create the highest business exposure because they can lead to privileged persistence and sensitive-data loss.",
    next24Hours: [
      "Contain privileged identity and service-account access.",
      "Preserve audit evidence across Okta, CloudTrail, Kubernetes, and GitHub.",
      "Complete scope review for S3 object access and affected production workloads."
    ]
  };
}
