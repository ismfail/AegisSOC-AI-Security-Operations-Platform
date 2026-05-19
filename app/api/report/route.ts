import { NextResponse } from "next/server";
import { generateExecutiveReport } from "@/lib/analytics";

export async function GET() {
  return NextResponse.json(generateExecutiveReport());
}
