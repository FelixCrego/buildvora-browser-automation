import { NextResponse } from "next/server";

type AutomationBriefPayload = {
  company?: string;
  contactName?: string;
  email?: string;
  automationType?: string;
  selectedPlan?: string;
  goal?: string;
  systems?: string;
  volume?: string;
  guardrails?: string;
  promptPack?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isValidPayload(payload: AutomationBriefPayload) {
  return Boolean(
    payload.company?.trim() &&
      payload.contactName?.trim() &&
      payload.email?.includes("@") &&
      payload.automationType?.trim() &&
      payload.goal?.trim(),
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AutomationBriefPayload;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Company, contact name, email, automation type, and goal are required to generate the file.",
        },
        { status: 400 },
      );
    }

    const generatedAt = new Date().toISOString();
    const companySlug = slugify(payload.company ?? "buildvora-client");
    const automationSlug = slugify(payload.automationType ?? "automation");

    const brief = {
      source: "buildvora-browser-automation",
      generatedAt,
      client: {
        company: payload.company,
        contactName: payload.contactName,
        email: payload.email,
      },
      automationProfile: {
        type: payload.automationType,
        selectedPlan: payload.selectedPlan,
        goal: payload.goal,
        systems: payload.systems,
        expectedVolume: payload.volume,
        guardrails: payload.guardrails,
      },
      runtimeNotes: {
        creditModel: "Credits are consumed by browser depth, retries, verification load, and cross-system handoffs.",
        trialMode: "Free trial includes limited guarded runs and one initial deployment packet.",
        productionMode: "Paid plans increase available credits, concurrency, and optimization support.",
      },
      runbook: [
        "Validate credentials, session requirements, and approval policy.",
        "Map each browser task to deterministic checkpoints.",
        "Enable human approval for irreversible or sensitive actions.",
        "Run verification checks after each key state change.",
        "Review failures, optimize selectors, and redeploy.",
      ],
      chatgptPromptPack: payload.promptPack,
    };

    return new NextResponse(JSON.stringify(brief, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${companySlug}-${automationSlug}-automation-brief.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected error generating automation brief.",
      },
      { status: 500 },
    );
  }
}
