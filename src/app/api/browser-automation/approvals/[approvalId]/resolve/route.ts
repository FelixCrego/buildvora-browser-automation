import { NextResponse } from "next/server";
import { resolveWorkflowApproval } from "@/lib/browserAutomationPortal";

type ApprovalPayload = {
  approved?: boolean;
  approver?: string;
  notes?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ approvalId: string }> },
) {
  try {
    const payload = (await request.json()) as ApprovalPayload;
    const { approvalId } = await params;

    if (typeof payload.approved !== "boolean") {
      return NextResponse.json({ ok: false, message: "approved is required." }, { status: 400 });
    }

    const run = await resolveWorkflowApproval({
      approvalId,
      approved: payload.approved,
      approver: payload.approver,
      notes: payload.notes,
    });

    return NextResponse.json({
      ok: true,
      run,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected approval resolution error.",
      },
      { status: 500 },
    );
  }
}
