import { NextResponse } from "next/server";
import { buildAnalystAnswer } from "@/lib/analytics";

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string };
  const question = body.question?.trim() || "What should we prioritize first?";

  return NextResponse.json(buildAnalystAnswer(question));
}
