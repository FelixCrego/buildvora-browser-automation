import {
  HeuristicWorkflowBuilder,
  OpenAIWorkflowBuilder,
  estimateWorkflowCredits,
} from "@buildvora/browser-automation";
import { NextResponse } from "next/server";
import { applyWorkspaceAccountCookies, getWorkspaceSession, SESSION_COOKIE_NAMES } from "@/lib/browserAutomationAuth";
import { getAccountBySlug, spendCreditsFromAccount } from "@/lib/browserAutomationPortal";

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
    const session = await getWorkspaceSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Sign in before building an automation." }, { status: 401 });
    }

    const persistedAccount = getAccountBySlug(session.accountSlug);
    const availableCredits = persistedAccount?.availableCredits ?? session.availableCredits ?? session.trialCreditsRemaining ?? 0;
    if (availableCredits < 5) {
      return NextResponse.json(
        { ok: false, message: "You need at least 5 credits remaining to build an automation scope." },
        { status: 402 },
      );
    }

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
    const response = NextResponse.json({
      ok: true,
      result: {
        automationName: draft.workflow.name,
        summary: `Built from the package harness for ${company}. This workflow is ready to move repeated browser work into a credits-based execution path with verification and approval checkpoints.`,
        systems: draft.workflow.systems,
        approvals: draft.workflow.approvals,
        recommendedPlan:
          draft.workflow.riskLevel === "high"
            ? "Operator Deployment with guarded approval policies, then expand into a managed rollout after the first production loop stabilizes."
            : "Starter for early live runs, then Operator once recurring production usage and approval volume increase.",
        estimatedCreditsPerRun: `${estimate.estimatedCredits} estimated credits / run`,
        rolloutPath: [
          "Review the generated workflow draft and approval policy.",
          "Attach browser credentials and target systems in the client workspace.",
          "Reserve credits and launch a guarded pilot run.",
          "Promote the workflow version after evidence and failure handling are reviewed.",
        ],
        runtimeModel: draft.metadata.model,
      },
      creditsDebited: 5,
    });

    if (persistedAccount) {
      const updatedAccount = spendCreditsFromAccount({
        accountSlug: session.accountSlug,
        amount: 5,
        note: `Voice builder automation scope for ${company}`,
        actor: session.email,
        source: "run",
      });
      applyWorkspaceAccountCookies(response, updatedAccount);
    } else {
      const nextCredits = availableCredits - 5;
      response.cookies.set(SESSION_COOKIE_NAMES.availableCredits, String(nextCredits), { httpOnly: true, sameSite: "lax", path: "/" });
      response.cookies.set(
        SESSION_COOKIE_NAMES.trialCreditsRemaining,
        String(Math.max(0, (session.trialCreditsRemaining ?? nextCredits) - 5)),
        { httpOnly: true, sameSite: "lax", path: "/" },
      );
    }

    return response;
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
