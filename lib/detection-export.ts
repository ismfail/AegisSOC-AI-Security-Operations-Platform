import { detectionRules, type DetectionRule } from "@/lib/security-data";

function normalizeRuleName(rule: DetectionRule) {
  return rule.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function toSigmaRule(rule: DetectionRule) {
  return {
    title: rule.name,
    id: rule.id,
    status: rule.status === "Production" ? "stable" : "test",
    description: rule.logic,
    references: [`https://attack.mitre.org/techniques/${rule.mitre.split(" ")[0].replace("T", "T")}/`],
    author: rule.owner,
    date: rule.lastTuned,
    tags: [`attack.${rule.mitre.split(" ")[0].toLowerCase()}`, `aegissoc.${rule.source.toLowerCase()}`],
    logsource: {
      product: rule.source.toLowerCase(),
      service: rule.source
    },
    detection: {
      selection: Object.fromEntries(rule.signals.map((signal) => [signal, true])),
      condition: "selection"
    },
    falsepositives: [`Estimated ${rule.falsePositiveRate}% false-positive rate in simulation.`],
    level: rule.severity.toLowerCase()
  };
}

export function toKql(rule: DetectionRule) {
  const table =
    rule.source === "CloudTrail"
      ? "AWSCloudTrail"
      : rule.source === "Kubernetes"
        ? "KubeAudit"
        : rule.source === "GitHub"
          ? "GitHubAudit"
          : rule.source === "Okta"
            ? "Okta_CL"
            : "SecurityEvent";
  const signalClauses = rule.signals.map((signal) => `| where tostring(RawEvent) has "${signal}"`).join("\n");

  return `${table}\n| where TimeGenerated > ago(24h)\n${signalClauses}\n| extend AegisRuleId = "${rule.id}", MitreTechnique = "${rule.mitre}", Severity = "${rule.severity}"`;
}

export function toSqlDetection(rule: DetectionRule) {
  const signalChecks = rule.signals
    .map((signal) => `raw::text ILIKE '%${signal.replace(/'/g, "''")}%'`)
    .join(" OR ");

  return `SELECT id, timestamp, source, actor, action, asset_id, risk_score\nFROM security_events\nWHERE source = '${rule.source}'\n  AND (${signalChecks})\nORDER BY risk_score DESC, timestamp DESC;`;
}

export function exportDetectionPack() {
  return {
    name: "AegisSOC Detection Pack",
    version: "2026.05",
    generatedAt: "2026-05-18T12:00:00.000Z",
    rules: detectionRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      sigma: toSigmaRule(rule),
      microsoftSentinelKql: toKql(rule),
      postgresHuntSql: toSqlDetection(rule),
      quality: {
        testCoverage: rule.testCoverage,
        precision: rule.precision,
        recall: rule.recall,
        falsePositiveRate: rule.falsePositiveRate
      }
    }))
  };
}
