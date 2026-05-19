import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, BrainCircuit, Fingerprint, GitBranch, ShieldAlert, Workflow } from "lucide-react";
import { incidents } from "@/lib/security-data";
import {
  buildIncidentGraph,
  getBlastRadius,
  getIncidentById,
  getMatchingDetections,
  getRelatedEvents
} from "@/lib/correlation-engine";
import { Badge, Bar, EvidenceList, Metric, Panel, PlatformHeader } from "@/components/soc-components";

export function generateStaticParams() {
  return incidents.map((incident) => ({ id: incident.id }));
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = getIncidentById(id);

  if (!incident) {
    notFound();
  }

  const events = getRelatedEvents(incident);
  const rules = getMatchingDetections(incident);
  const blastRadius = getBlastRadius(incident);
  const graph = buildIncidentGraph(incident);

  return (
    <main className="min-h-screen text-slate-100">
      <PlatformHeader
        eyebrow="Incident Workbench"
        title={`${incident.id}: ${incident.title}`}
        description="Evidence graph, detection coverage, blast-radius analysis, playbook guidance, and audit-ready response notes."
      />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Severity" value={incident.severity} detail={incident.status} />
          <Metric label="Risk score" value={`${incident.riskScore}/100`} detail={incident.mitre} />
          <Metric label="Evidence events" value={events.length} detail={incident.source} />
          <Metric label="Detection rules" value={rules.length} detail="Matched to this incident" />
        </div>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Incident Narrative" icon={<ShieldAlert className="size-5 text-risk" />}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={incident.severity === "Critical" ? "red" : "orange"}>{incident.severity}</Badge>
              <Badge tone="blue">{incident.source}</Badge>
              <Badge tone="muted">{incident.status}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The incident centers on <span className="font-semibold text-slate-100">{incident.identity}</span>{" "}
              interacting with <span className="font-semibold text-slate-100">{incident.asset}</span> from{" "}
              <span className="font-semibold text-slate-100">{incident.ip}</span>. The mapped technique is{" "}
              <span className="font-semibold text-signal">{incident.mitre}</span>.
            </p>
            <div className="mt-5 grid gap-4">
              <EvidenceList title="Evidence" rows={incident.evidence} />
              <EvidenceList title="Recommended playbook" rows={incident.playbook} />
            </div>
          </Panel>

          <Panel title="Evidence Graph" icon={<GitBranch className="size-5 text-pulse" />}>
            <div className="grid gap-3">
              {graph.nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div>
                    <div className="font-medium">{node.label}</div>
                    <div className="text-xs uppercase text-slate-500">{node.group}</div>
                  </div>
                  <Badge tone={node.group === "incident" ? "red" : node.group === "detection" ? "green" : "muted"}>
                    {node.id}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <Panel title="Related Telemetry" icon={<Activity className="size-5 text-signal" />}>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{event.action}</span>
                    <Badge tone="blue">{event.risk}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {event.timestamp} - {event.actor} - {event.ip}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Matched Detections" icon={<BrainCircuit className="size-5 text-signal" />}>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="green">{rule.id}</Badge>
                    <Badge tone="muted">{rule.status}</Badge>
                  </div>
                  <div className="font-medium">{rule.name}</div>
                  <Bar label="Precision" value={`${rule.precision}%`} width={rule.precision} />
                  <Bar label="Recall" value={`${rule.recall}%`} width={rule.recall} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Blast Radius" icon={<Fingerprint className="size-5 text-risk" />}>
            <p className="text-sm leading-6 text-slate-300">{blastRadius.estimatedBusinessImpact}</p>
            <div className="mt-4 space-y-3">
              {blastRadius.primaryAsset ? (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-medium">{blastRadius.primaryAsset.service}</div>
                  <div className="text-xs text-slate-500">
                    {blastRadius.primaryAsset.owner} - {blastRadius.primaryAsset.environment} -{" "}
                    {blastRadius.primaryAsset.exposure}
                  </div>
                </div>
              ) : null}
              {blastRadius.relatedAssets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-medium">{asset.service}</div>
                  <div className="text-xs text-slate-500">Related owner: {asset.owner}</div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Workflow className="size-4 text-signal" />
                Analyst handoff
              </div>
              <p className="mt-1 text-sm text-slate-400">
                This page is designed to be screenshot-ready for a SOC handoff or recruiter demo.
              </p>
            </div>
            <Link href="/api/stix" className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void">
              Export STIX bundle
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
