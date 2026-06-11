import {
  HeuristicWorkflowBuilder,
  OpenAIWorkflowBuilder,
  estimateWorkflowCredits,
} from "@buildvora/browser-automation";
import { NextResponse } from "next/server";

type VoiceBuilderPayload = {
  company?: string;
  transcript?: string;
};

const MAX_FIELD_LENGTH = 4000;

function resolveBuilder() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIWorkflowBuilder();
  }

  return new HeuristicWorkflowBuilder();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VoiceBuilderPayload;
    const transcript = payload.transcript?.trim();
    const company = payload.company?.trim() || "Client Workspace";

    if (!transcript) {
      return NextResponse.json(
        {
          ok: false,
          message: "A transcript or typed workflow description is required.",
        },
        { status: 400 },
      );
    }

    if (transcript.length < 20) {
      return NextResponse.json(
        {
          ok: false,
          message: "Add more workflow detail before building the automation scope.",
        },
        { status: 400 },
      );
    }

    if (transcript.length > MAX_FIELD_LENGTH || company.length > 120) {
      return NextResponse.json(
        {
          ok: false,
          message: "Input is too long. Shorten the request and try again.",
        },
        { status: 400 },
      );
    }

    const builder = resolveBuilder();
    const draft = await builder.buildFromTranscript({
      company,
      transcript,
    });
    const estimate = estimateWorkflowCredits(draft.workflow);

    return NextResponse.json({
      ok: true,
      result: {
        automationName: draft.workflow.name,
        summary: `Built from the package harness for ${company}. This workflow is ready to move repeated browser work into a credits-based execution path with verification and approval checkpoints.`,
        systems: draft.workflow.systems,
        approvals: draft.workflow.approvals,
        recommendedPlan:
          draft.workflow.riskLevel === "high"
            ? "Operator Deployment with guarded approval policies, then expand into a managed rollout after the first production loop stabilizes."
            : "Operator Deployment for the initial workflow, followed by portfolio expansion after run quality is verified.",
        estimatedCreditsPerRun: `${estimate.estimatedCredits} estimated credits / run`,
        rolloutPath: [
          "Review the generated workflow draft and approval policy.",
          "Attach browser credentials and target systems in the client workspace.",
          "Reserve credits and launch a guarded pilot run.",
          "Promote the workflow version after evidence and failure handling are reviewed.",
        ],
        runtimeModel: draft.metadata.model,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected voice builder error.",
      },
      { status: 500 },
    );
  }
}
