import { NextResponse } from "next/server";
import { getWorkflowBySlug } from "@/lib/browserAutomationPortal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowSlug: string }> },
) {
  const { workflowSlug } = await params;
  const workflow = await getWorkflowBySlug(workflowSlug);

  if (!workflow) {
    return NextResponse.json({ ok: false, message: "Workflow not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    workflow,
  });
}
