import { Activity, BrainCircuit, FlaskConical, Gauge, Radar } from "lucide-react";
import { detectionRules } from "@/lib/security-data";
import { getAutomationReadiness, getDetectionCoverage, runAiEvaluationSuite } from "@/lib/correlation-engine";
import { Badge, Bar, Metric, Panel, PlatformHeader } from "@/components/soc-components";

export default function DetectionsPage() {
  const coverage = getDetectionCoverage();
  const evals = runAiEvaluationSuite();
  const automation = getAutomationReadiness();

  return (
    <main className="min-h-screen text-slate-100">
      <PlatformHeader
        eyebrow="Detection Engineering"
        title="Detection Lab and AI Evaluation Harness"
        description="Rule lifecycle, ATT&CK coverage, precision and recall tracking, prompt regression tests, and automation readiness."
      />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5">
        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Detection rules" value={coverage.rules} detail={`${coverage.productionRules} production`} />
          <Metric label="Avg precision" value={`${coverage.averagePrecision}%`} detail="Rule quality metric" />
          <Metric label="Avg recall" value={`${coverage.averageRecall}%`} detail="Coverage metric" />
          <Metric label="AI eval pass rate" value={`${evals.passRate}%`} detail={`${evals.averageScore}% avg score`} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel title="Production Detection Rules" icon={<Radar className="size-5 text-signal" />}>
            <div className="space-y-4">
              {detectionRules.map((rule) => (
                <div key={rule.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="green">{rule.id}</Badge>
                      <Badge tone={rule.status === "Production" ? "blue" : "orange"}>{rule.status}</Badge>
                      <Badge tone="muted">{rule.version}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-signal">{rule.severity}</span>
                  </div>
                  <h2 className="mt-3 text-base font-semibold">{rule.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{rule.logic}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Bar label="Coverage" value={`${rule.testCoverage}%`} width={rule.testCoverage} />
                    <Bar label="Precision" value={`${rule.precision}%`} width={rule.precision} />
                    <Bar label="Recall" value={`${rule.recall}%`} width={rule.recall} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {rule.signals.map((signal) => (
                      <Badge key={signal} tone="muted">{signal}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Coverage Summary" icon={<Gauge className="size-5 text-pulse" />}>
            <div className="space-y-4">
              <Bar label="ATT&CK techniques covered" value={`${coverage.coveredTechniques}`} width={coverage.coveredTechniques * 22} />
              <Bar label="Incident coverage" value={`${coverage.coveredIncidents}`} width={coverage.coveredIncidents * 22} />
              <Bar label="Average test coverage" value={`${coverage.averageCoverage}%`} width={coverage.averageCoverage} />
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold">Detection philosophy</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Each rule tracks owner, version, tuning date, ATT&CK mapping, expected signals,
                  and measurable quality metrics so the platform can be improved like production detection code.
                </p>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel title="AI Analyst Regression Tests" icon={<FlaskConical className="size-5 text-signal" />}>
            <div className="space-y-3">
              {evals.cases.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={item.pass ? "green" : "red"}>{item.pass ? "Pass" : "Fail"}</Badge>
                      <Badge tone="blue">{item.riskArea}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-signal">{item.score}%</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{item.prompt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.matchedSignals.map((signal) => (
                      <Badge key={signal} tone="muted">{signal}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Automation Readiness" icon={<Activity className="size-5 text-risk" />}>
            <div className="space-y-4">
              {automation.map((playbook) => (
                <div key={playbook.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{playbook.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{playbook.owner}</div>
                    </div>
                    <Badge tone={playbook.automationLevel === "Auto-contained" ? "green" : "orange"}>
                      {playbook.automationLevel}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Bar label="Readiness" value={`${playbook.readiness}%`} width={playbook.readiness} />
                  </div>
                  {playbook.blockers.length ? (
                    <p className="mt-3 text-sm text-slate-400">{playbook.blockers[0]}</p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">Safe to execute automatically after confidence threshold is met.</p>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <Panel title="API Surface" icon={<BrainCircuit className="size-5 text-signal" />}>
          <div className="grid gap-3 md:grid-cols-3">
            <Endpoint method="GET" path="/api/correlation?incidentId=INC-2407" detail="Incident graph, blast radius, compliance, and automation readiness." />
            <Endpoint method="GET" path="/api/evals" detail="Prompt regression suite and AI analyst quality metrics." />
            <Endpoint method="GET" path="/api/stix" detail="Threat-intel bundle export in STIX-style JSON." />
            <Endpoint method="GET" path="/api/detections/export" detail="Detection pack export with Sigma-style rules, KQL, and SQL hunts." />
          </div>
        </Panel>
      </div>
    </main>
  );
}

function Endpoint({ method, path, detail }: { method: string; path: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2">
        <Badge tone="green">{method}</Badge>
        <code className="text-xs text-slate-300">{path}</code>
      </div>
      <p className="mt-3 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
