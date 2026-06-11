import { NextResponse } from "next/server";

type VoiceBuilderPayload = {
  company?: string;
  transcript?: string;
};

const MAX_FIELD_LENGTH = 4000;

function dedupe(items: string[]) {
  return Array.from(new Set(items));
}

function detectSystems(transcript: string) {
  const lower = transcript.toLowerCase();
  const systems: string[] = [];

  if (lower.includes("linkedin")) systems.push("LinkedIn");
  if (lower.includes("gmail") || lower.includes("email") || lower.includes("inbox")) systems.push("Gmail");
  if (lower.includes("clio")) systems.push("Clio");
  if (lower.includes("crm")) systems.push("CRM");
  if (lower.includes("hubspot")) systems.push("HubSpot");
  if (lower.includes("portal")) systems.push("Portal");
  if (lower.includes("scheduler") || lower.includes("scheduling")) systems.push("Scheduling Platform");
  if (lower.includes("payer") || lower.includes("insurance")) systems.push("Payer Portal");
  if (lower.includes("amazon")) systems.push("Amazon");
  if (lower.includes("robinhood") || lower.includes("broker")) systems.push("Broker Dashboard");

  return dedupe(systems.length ? systems : ["Browser Portal", "Gmail", "CRM"]);
}

function detectApprovals(transcript: string) {
  const lower = transcript.toLowerCase();
  const approvals: string[] = [];

  if (lower.includes("email") || lower.includes("message")) approvals.push("Require approval before outbound communication.");
  if (lower.includes("edit") || lower.includes("update") || lower.includes("change")) approvals.push("Require approval before record or account changes.");
  if (lower.includes("submit") || lower.includes("send")) approvals.push("Pause before final submission or send action.");
  if (lower.includes("client") || lower.includes("patient") || lower.includes("customer")) approvals.push("Keep customer-facing moments behind explicit operator release.");

  return dedupe(approvals.length ? approvals : ["Require approval before any external message, submission, or irreversible action."]);
}

function estimateCredits(transcript: string) {
  const lower = transcript.toLowerCase();
  let min = 24;
  let max = 48;

  if (lower.includes("portal")) {
    min += 12;
    max += 24;
  }
  if (lower.includes("verify") || lower.includes("validation")) {
    min += 10;
    max += 18;
  }
  if (lower.includes("approval")) {
    min += 8;
    max += 16;
  }
  if (lower.includes("multi") || lower.includes("multiple") || lower.includes("batch")) {
    min += 14;
    max += 34;
  }

  return `${min}-${max} credits / run`;
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

    const systems = detectSystems(transcript);
    const approvals = detectApprovals(transcript);
    const estimatedCreditsPerRun = estimateCredits(transcript);
    const firstSystem = systems[0] || "Browser Workflow";

    return NextResponse.json({
      ok: true,
      result: {
        automationName: `${company} ${firstSystem} Automation`,
        summary: `Scoped from voice intake for ${company}. This automation is designed to move repeated browser work into a credits-based execution flow with verification checkpoints, human approvals, and tracked run evidence.`,
        systems,
        approvals,
        recommendedPlan:
          "Operator Deployment for a single governed workflow, with the option to expand into a portfolio rollout once the first execution loop is stable.",
        estimatedCreditsPerRun,
        rolloutPath: [
          "Convert the transcript into a normalized workflow version and approval policy.",
          "Connect credentials for each browser surface involved in the run.",
          "Launch a guarded pilot with credits reserved before execution begins.",
          "Review evidence, optimize selectors, and publish the production version.",
        ],
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
