import { NextResponse } from "next/server";
import {
  buildIncidentGraph,
  getAutomationReadiness,
  getBlastRadius,
  getCompliancePosture,
  getDetectionCoverage,
  getIncidentById
} from "@/lib/correlation-engine";
import { rankIncidents } from "@/lib/analytics";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const incidentId = url.searchParams.get("incidentId") ?? rankIncidents()[0].id;
  const incident = getIncidentById(incidentId);

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({
    incident,
    graph: buildIncidentGraph(incident),
    blastRadius: getBlastRadius(incident),
    detectionCoverage: getDetectionCoverage(),
    compliancePosture: getCompliancePosture(),
    automationReadiness: getAutomationReadiness()
  });
}
