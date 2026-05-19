import { NextResponse } from "next/server";
import { exportDetectionPack } from "@/lib/detection-export";

export async function GET() {
  return NextResponse.json(exportDetectionPack(), {
    headers: {
      "Content-Disposition": "attachment; filename=aegissoc-detection-pack.json"
    }
  });
}
