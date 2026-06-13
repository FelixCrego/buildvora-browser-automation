import { NextResponse } from "next/server";
import { operateWorker } from "@/lib/browserAutomationPortal";

type Payload = {
  action?: "drain" | "restore";
  actor?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workerId: string }> },
) {
  try {
    const { workerId } = await params;
    const payload = (await request.json()) as Payload;

    if (!payload.action) {
      return NextResponse.json({ ok: false, message: "action is required." }, { status: 400 });
    }

    const result = await operateWorker({
      workerId,
      action: payload.action,
      actor: payload.actor,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected worker operation error." },
      { status: 500 },
    );
  }
}
