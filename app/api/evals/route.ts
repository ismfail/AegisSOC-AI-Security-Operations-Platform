import { NextResponse } from "next/server";
import { runAiEvaluationSuite } from "@/lib/correlation-engine";

export async function GET() {
  return NextResponse.json(runAiEvaluationSuite());
}
