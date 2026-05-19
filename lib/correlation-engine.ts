import {
  assets,
  auditEvents,
  complianceControls,
  detectionRules,
  evaluationCases,
  incidents,
  logEvents,
  playbooks,
  threatIntel,
  type Incident
} from "@/lib/security-data";
import { buildAnalystAnswer } from "@/lib/analytics";

export function getIncidentById(id: string) {
  return incidents.find((incident) => incident.id === id);
}

export function getRelatedEvents(incident: Incident) {
  return logEvents.filter((event) => {
    return (
      event.source === incident.source ||
      event.actor === incident.identity ||
      event.asset === incident.asset ||
      event.ip === incident.ip
    );
  });
}

export function getMatchingDetections(incident: Incident) {
  return detectionRules.filter((rule) => {
    return rule.source === incident.source || rule.mitre === incident.mitre;
  });
}

export function getBlastRadius(incident: Incident) {
  const primaryAsset = assets.find((asset) => asset.service === incident.asset);
  const sameOwnerAssets = primaryAsset
    ? assets.filter((asset) => asset.owner === primaryAsset.owner && asset.id !== primaryAsset.id)
    : [];
  const relatedIncidents = incidents.filter((item) => {
    return item.id !== incident.id && (item.source === incident.source || item.identity === incident.identity);
  });

  return {
    primaryAsset,
    relatedAssets: sameOwnerAssets,
    relatedIncidents,
    estimatedBusinessImpact:
      incident.severity === "Critical"
        ? "High business impact: privileged access or production compute is in scope."
        : incident.severity === "High"
          ? "Material business impact: sensitive data exposure or customer-facing service risk."
          : "Moderate business impact: investigate before broad containment."
  };
}

export function buildIncidentGraph(incident: Incident) {
  const events = getRelatedEvents(incident);
  const detections = getMatchingDetections(incident);

  return {
    nodes: [
      { id: incident.id, label: incident.title, group: "incident" },
      { id: incident.identity, label: incident.identity, group: "identity" },
      { id: incident.asset, label: incident.asset, group: "asset" },
      ...events.map((event) => ({ id: event.id, label: event.action, group: "event" })),
      ...detections.map((rule) => ({ id: rule.id, label: rule.name, group: "detection" }))
    ],
    edges: [
      { from: incident.id, to: incident.identity, label: "actor" },
      { from: incident.id, to: incident.asset, label: "target" },
      ...events.map((event) => ({ from: event.id, to: incident.id, label: "evidence" })),
      ...detections.map((rule) => ({ from: rule.id, to: incident.id, label: "matched" }))
    ]
  };
}

export function getDetectionCoverage() {
  const coveredTechniques = new Set(detectionRules.map((rule) => rule.mitre));
  const incidentTechniques = new Set(incidents.map((incident) => incident.mitre));
  const coveredIncidents = incidents.filter((incident) => coveredTechniques.has(incident.mitre));
  const averagePrecision =
    detectionRules.reduce((total, rule) => total + rule.precision, 0) / detectionRules.length;
  const averageRecall = detectionRules.reduce((total, rule) => total + rule.recall, 0) / detectionRules.length;
  const averageCoverage =
    detectionRules.reduce((total, rule) => total + rule.testCoverage, 0) / detectionRules.length;

  return {
    rules: detectionRules.length,
    incidentTechniques: incidentTechniques.size,
    coveredTechniques: coveredTechniques.size,
    coveredIncidents: coveredIncidents.length,
    averagePrecision: Math.round(averagePrecision),
    averageRecall: Math.round(averageRecall),
    averageCoverage: Math.round(averageCoverage),
    productionRules: detectionRules.filter((rule) => rule.status === "Production").length,
    tuningRules: detectionRules.filter((rule) => rule.status === "Tuning").length
  };
}

export function runAiEvaluationSuite() {
  const results = evaluationCases.map((item) => {
    const response = buildAnalystAnswer(item.prompt);
    const text = [response.answer, ...response.evidence, ...response.actions].join(" ").toLowerCase();
    const matchedSignals = item.expectedSignals.filter((signal) => text.includes(signal.toLowerCase()));
    const score = Math.round((matchedSignals.length / item.expectedSignals.length) * 100);

    return {
      id: item.id,
      prompt: item.prompt,
      riskArea: item.riskArea,
      score,
      matchedSignals,
      missingSignals: item.expectedSignals.filter((signal) => !matchedSignals.includes(signal)),
      pass: score >= 70,
      passCriteria: item.passCriteria
    };
  });

  return {
    cases: results,
    passRate: Math.round((results.filter((result) => result.pass).length / results.length) * 100),
    averageScore: Math.round(results.reduce((total, result) => total + result.score, 0) / results.length)
  };
}

export function getCompliancePosture() {
  return {
    controls: complianceControls,
    auditEvents,
    passing: complianceControls.filter((control) => control.status === "Passing").length,
    atRisk: complianceControls.filter((control) => control.status === "At risk").length,
    needsEvidence: complianceControls.filter((control) => control.status === "Needs evidence").length
  };
}

export function exportStixBundle() {
  const created = "2026-05-18T12:00:00.000Z";
  return {
    type: "bundle",
    id: "bundle--aegissoc-demo",
    spec_version: "2.1",
    objects: [
      ...incidents.map((incident) => ({
        type: "observed-data",
        id: `observed-data--${incident.id.toLowerCase()}`,
        created,
        modified: created,
        first_observed: created,
        last_observed: created,
        number_observed: 1,
        labels: [incident.severity.toLowerCase(), incident.source.toLowerCase()],
        object_refs: [incident.asset, incident.identity],
        x_aegis_mitre: incident.mitre,
        x_aegis_risk_score: incident.riskScore
      })),
      ...threatIntel.map((note) => ({
        type: "report",
        id: `report--${note.id.toLowerCase()}`,
        created,
        modified: created,
        name: note.title,
        labels: [note.tag, note.confidence.toLowerCase()],
        description: note.summary,
        published: created
      }))
    ]
  };
}

export function getAutomationReadiness() {
  return playbooks.map((playbook) => {
    const blockers =
      playbook.automationLevel === "Auto-contained"
        ? []
        : ["Human approval required before disruptive production action."];

    return {
      ...playbook,
      readiness:
        playbook.automationLevel === "Auto-contained"
          ? 92
          : playbook.automationLevel === "Approval required"
            ? 72
            : 48,
      blockers
    };
  });
}
