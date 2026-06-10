import { NextResponse } from "next/server";
import { getAdminControlPlaneSnapshot } from "@/lib/browserAutomationPortal";

export async function GET() {
  return NextResponse.json({
    ok: true,
    snapshot: getAdminControlPlaneSnapshot(),
  });
}
