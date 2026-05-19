import { NextResponse } from "next/server";
import {
  getAnomalyScores,
  getAttackTimeline,
  getMitreCoverage,
  getSocSnapshot,
  rankIncidents
} from "@/lib/analytics";
import { assets, logEvents, playbooks, threatIntel } from "@/lib/security-data";

export async function GET() {
  return NextResponse.json({
    snapshot: getSocSnapshot(),
    incidents: rankIncidents(),
    timeline: getAttackTimeline(),
    mitreCoverage: getMitreCoverage(),
    anomalies: getAnomalyScores(),
    assets,
    logEvents,
    playbooks,
    threatIntel
  });
}
