import { ClipboardCheck, Database, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { getCompliancePosture } from "@/lib/correlation-engine";
import { Badge, EvidenceList, Metric, Panel, PlatformHeader } from "@/components/soc-components";

export default function CompliancePage() {
  const posture = getCompliancePosture();

  return (
    <main className="min-h-screen text-slate-100">
      <PlatformHeader
        eyebrow="Trust and Governance"
        title="Compliance Evidence and Audit Center"
        description="HIPAA, SOC 2, and NIST CSF control mapping with incident evidence, approval gates, and immutable response history."
      />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5">
        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Controls tracked" value={posture.controls.length} detail="HIPAA, SOC 2, NIST CSF" />
          <Metric label="Passing" value={posture.passing} detail="Evidence attached" />
          <Metric label="Needs evidence" value={posture.needsEvidence} detail="Open collection work" />
          <Metric label="At risk" value={posture.atRisk} detail="Requires leadership attention" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Control Evidence Matrix" icon={<ClipboardCheck className="size-5 text-signal" />}>
            <div className="space-y-4">
              {posture.controls.map((control) => (
                <div key={control.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{control.framework}</Badge>
                      <Badge tone={control.status === "Passing" ? "green" : control.status === "At risk" ? "red" : "orange"}>
                        {control.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-slate-300">{control.id}</span>
                  </div>
                  <h2 className="mt-3 font-semibold">{control.domain}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{control.requirement}</p>
                  <div className="mt-4">
                    <EvidenceList title="Evidence" rows={control.evidence} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {control.mappedIncidents.map((incidentId) => (
                      <Badge key={incidentId} tone="muted">{incidentId}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Audit Trail" icon={<Database className="size-5 text-pulse" />}>
            <div className="space-y-3">
              {posture.auditEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge tone={event.result === "Blocked" ? "red" : event.result === "Approved" ? "green" : "blue"}>
                      {event.result}
                    </Badge>
                    <span className="text-xs text-slate-500">{event.timestamp}</span>
                  </div>
                  <div className="mt-3 font-medium">{event.action}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {event.actor} - {event.target}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <GovernanceCard
            icon={<LockKeyhole className="size-5 text-signal" />}
            title="Approval gates"
            text="Identity revocation and cloud-key disabling require human approval because automated action can interrupt production workflows."
          />
          <GovernanceCard
            icon={<ShieldCheck className="size-5 text-signal" />}
            title="HIPAA-safe evidence"
            text="The demo models sensitive healthcare operations without storing real patient data, secrets, or production credentials."
          />
          <GovernanceCard
            icon={<FileCheck2 className="size-5 text-signal" />}
            title="Audit-ready reporting"
            text="Every major incident can produce an executive brief, evidence list, STIX-style bundle, and mapped compliance controls."
          />
        </section>
      </div>
    </main>
  );
}

function GovernanceCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
      <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-signal/10 text-signal">{icon}</div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
