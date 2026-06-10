import { NextResponse } from "next/server";
import { getRunById } from "@/lib/browserAutomationPortal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    return NextResponse.json({ ok: false, message: "Run not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    run,
  });
}
