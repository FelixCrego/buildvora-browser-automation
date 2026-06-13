import { NextResponse } from "next/server";
import { getLaunchDiagnostics } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = await getLaunchDiagnostics();
  const status = diagnostics.database.status === "ready" ? 200 : 503;
  return NextResponse.json(
    {
      ok: diagnostics.database.status === "ready",
      diagnostics,
    },
    { status },
  );
}

