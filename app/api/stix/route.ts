import { NextResponse } from "next/server";
import { exportStixBundle } from "@/lib/correlation-engine";

export async function GET() {
  return NextResponse.json(exportStixBundle(), {
    headers: {
      "Content-Disposition": "attachment; filename=aegissoc-threat-bundle.json"
    }
  });
}
