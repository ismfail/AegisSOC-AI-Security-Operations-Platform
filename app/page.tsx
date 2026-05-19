import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Bot, BrainCircuit, Database, FileText, Radar, ShieldAlert, Workflow } from "lucide-react";
import { getAnomalyScores, getAttackTimeline, getMitreCoverage, getSocSnapshot, rankIncidents } from "@/lib/analytics";
import { assets, playbooks, threatIntel, type Severity } from "@/lib/security-data";
import { Badge, Bar, EvidenceList, Metric, Panel, PlatformHeader } from "@/components/soc-components";

const severityTone: Record<Severity, "red" | "orange" | "blue" | "green"> = {
  Critical: "red",
  High: "orange",
  Medium: "blue",
  Low: "green"
};

export default function Home() {
  const snapshot = getSocSnapshot();
  const incidents = rankIncidents();
  const topIncident = incidents[0];
  const timeline = getAttackTimeline();
  const anomalies = getAnomalyScores();
  const mitreCoverage = getMitreCoverage();

  return (
    <main className="min-h-screen text-slate-100">
      <PlatformHeader
        eyebrow="SOC Command Center"
        title="AegisSOC Security Operations Platform"
        description="AI-native incident triage, simulated SIEM ingestion, detection engineering, RAG threat intelligence, playbook automation, and compliance evidence."
      />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Open incidents" value={snapshot.openIncidents} detail="SOC queue" />
          <Metric label="Critical incidents" value={snapshot.criticalIncidents} detail="P1/P2 risk" />
          <Metric label="Average risk" value={`${snapshot.averageRisk}/100`} detail="Incident risk score" />
          <Metric label="High-risk logs" value={snapshot.highRiskLogs} detail="Current window" />
          <Metric label="Critical assets" value={snapshot.criticalAssets} detail="Production systems" />
          <Metric label="Playbooks" value={playbooks.length} detail="Automation ready" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Incident Command Queue" icon={<AlertTriangle className="size-5 text-risk" />}>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-signal/50 hover:bg-signal/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="muted">{incident.id}</Badge>
                      <Badge tone={severityTone[incident.severity]}>{incident.severity}</Badge>
                      <Badge tone="blue">{incident.source}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-signal">{incident.riskScore}/100</span>
                  </div>
                  <h2 className="mt-3 text-base font-semibold">{incident.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {incident.mitre} - {incident.asset} - {incident.identity}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Aegis Analyst" icon={<Bot className="size-5 text-signal" />}>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="red">{topIncident.id}</Badge>
                <Badge tone="blue">{topIncident.mitre}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-200">
                Highest priority is {topIncident.title}. It combines privileged identity impact,
                correlated evidence, MITRE technique mapping, and a {topIncident.riskScore}/100 risk score.
              </p>
              <div className="mt-4">
                <EvidenceList title="Evidence" rows={topIncident.evidence} />
              </div>
              <div className="mt-4">
                <EvidenceList title="Recommended actions" rows={topIncident.playbook} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link href="/detections" className="rounded-md bg-signal px-4 py-2 text-center text-sm font-semibold text-void">
                Open detection lab
              </Link>
              <Link href="/compliance" className="rounded-md border border-white/10 px-4 py-2 text-center text-sm font-semibold text-slate-200">
                Open compliance center
              </Link>
              <Link href="/api/stix" className="rounded-md border border-white/10 px-4 py-2 text-center text-sm font-semibold text-slate-200">
                STIX export
              </Link>
              <Link href="/api/detections/export" className="rounded-md border border-white/10 px-4 py-2 text-center text-sm font-semibold text-slate-200">
                Detection pack
              </Link>
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <Panel title="Attack Timeline" icon={<Radar className="size-5 text-pulse" />}>
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.incidentId} className="grid grid-cols-[3.2rem_1fr] gap-3">
                  <div className="text-xs font-semibold text-slate-500">{event.time}</div>
                  <div className="border-l border-signal/30 pl-3">
                    <div className="text-sm font-semibold">{event.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {event.technique} - risk {event.riskScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="MITRE Coverage" icon={<BrainCircuit className="size-5 text-signal" />}>
            <div className="space-y-3">
              {mitreCoverage.map((row) => (
                <Bar key={row.incidentId} label={row.technique} value={`${row.riskScore}`} width={row.riskScore} />
              ))}
            </div>
          </Panel>

          <Panel title="Threat Intelligence" icon={<FileText className="size-5 text-signal" />}>
            <div className="space-y-3">
              {threatIntel.map((note) => (
                <div key={note.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{note.tag}</Badge>
                    <Badge tone="muted">{note.source}</Badge>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{note.title}</div>
                  <p className="mt-1 text-xs text-slate-400">{note.summary}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="High-Risk Telemetry" icon={<Database className="size-5 text-risk" />}>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Actor</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((event) => (
                    <tr key={event.id} className="border-b border-white/5">
                      <td className="py-3 pr-3 text-slate-400">{event.timestamp}</td>
                      <td className="py-3 pr-3">{event.source}</td>
                      <td className="py-3 pr-3">{event.actor}</td>
                      <td className="py-3 pr-3">{event.action}</td>
                      <td className="py-3 pr-3 text-signal">{event.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Critical Asset Graph" icon={<ShieldAlert className="size-5 text-signal" />}>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{asset.service}</div>
                      <div className="text-xs text-slate-500">
                        {asset.environment} - {asset.owner} - {asset.exposure}
                      </div>
                    </div>
                    <Badge tone={severityTone[asset.criticality]}>{asset.criticality}</Badge>
                  </div>
                  <div className="mt-3">
                    <Bar label="Open vulnerabilities" value={`${asset.vulnerabilities}`} width={asset.vulnerabilities * 18} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
          <div className="grid gap-4 md:grid-cols-4">
            <ArchitectureItem icon={<Database />} title="PostgreSQL + pgvector" text="Incidents, audit log, embeddings, threat notes." />
            <ArchitectureItem icon={<BrainCircuit />} title="AI Evaluation" text="Prompt regression tests and expected signal scoring." />
            <ArchitectureItem icon={<Workflow />} title="Playbooks" text="Approval-aware response automation and handoff." />
            <ArchitectureItem icon={<FileText />} title="Exports" text="STIX-style threat bundle plus Sigma/KQL/SQL detection pack." />
          </div>
        </section>
      </div>
    </main>
  );
}

function ArchitectureItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-signal/10 text-signal">
        {icon}
      </div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}
