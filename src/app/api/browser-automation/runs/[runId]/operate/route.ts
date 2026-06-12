import { NextResponse } from "next/server";
import { operateRun } from "@/lib/browserAutomationPortal";

type Payload = {
  action?: "pause" | "cancel" | "retry";
  actor?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const payload = (await request.json()) as Payload;

    if (!payload.action) {
      return NextResponse.json({ ok: false, message: "action is required." }, { status: 400 });
    }

    const result = await operateRun({
      runId,
      action: payload.action,
      actor: payload.actor,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected run operation error." },
      { status: 500 },
    );
  }
}
