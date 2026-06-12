import { NextResponse } from "next/server";
import { estimateRunLaunch, launchWorkflowRun } from "@/lib/browserAutomationPortal";

type LaunchPayload = {
  workflowSlug?: string;
  targetCount?: number;
  verificationMode?: "standard" | "heavy";
  execute?: boolean;
  requestedBy?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LaunchPayload;

    if (!payload.workflowSlug) {
      return NextResponse.json({ ok: false, message: "workflowSlug is required." }, { status: 400 });
    }

    const launch = estimateRunLaunch({
      workflowSlug: payload.workflowSlug,
      targetCount: payload.targetCount,
      verificationMode: payload.verificationMode,
    });

    if (!launch) {
      return NextResponse.json({ ok: false, message: "Workflow not found." }, { status: 404 });
    }

    if (payload.execute) {
      const execution = await launchWorkflowRun({
        workflowSlug: payload.workflowSlug,
        targetCount: payload.targetCount,
        verificationMode: payload.verificationMode,
        requestedBy: payload.requestedBy,
      });

      return NextResponse.json({
        ok: true,
        launch,
        run: execution.run,
      });
    }

    return NextResponse.json({
      ok: true,
      launch,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected launch estimation error.",
      },
      { status: 500 },
    );
  }
}
