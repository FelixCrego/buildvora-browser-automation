import { NextResponse } from "next/server";
import { operateConnection } from "@/lib/browserAutomationPortal";

type Payload = {
  action?: "reverify" | "rotate";
  actor?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  try {
    const { connectionId } = await params;
    const payload = (await request.json()) as Payload;

    if (!payload.action) {
      return NextResponse.json({ ok: false, message: "action is required." }, { status: 400 });
    }

    const result = await operateConnection({
      connectionId,
      action: payload.action,
      actor: payload.actor,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected connection operation error." },
      { status: 500 },
    );
  }
}
