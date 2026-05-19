import { NextResponse } from "next/server";
import { playbooks } from "@/lib/security-data";

export async function POST(request: Request) {
  const body = (await request.json()) as { playbookId?: string; incidentId?: string; approvedBy?: string };
  const playbook = playbooks.find((item) => item.id === body.playbookId) ?? playbooks[0];

  return NextResponse.json({
    executionId: `EXEC-${Date.now()}`,
    incidentId: body.incidentId ?? "INC-2407",
    playbookId: playbook.id,
    status: playbook.automationLevel === "Manual" ? "queued_for_manual_review" : "approved_simulation",
    approvedBy: body.approvedBy ?? "soc-analyst",
    executedSteps: playbook.steps.map((step, index) => ({
      order: index + 1,
      step,
      result: "simulated_success"
    })),
    audit:
      "This endpoint simulates playbook execution. Production mode would require approval gates, RBAC, signed actions, and immutable audit logging."
  });
}
