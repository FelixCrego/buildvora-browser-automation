import { NextResponse } from "next/server";

type MaispLeadPayload = {
  contact?: {
    fullName?: string;
    workEmail?: string;
    companyName?: string;
    roleTitle?: string;
    websiteUrl?: string;
    companySize?: string;
    aiBudgetBand?: string;
    pilotTimeline?: string;
  };
  profile?: Record<string, unknown>;
  diagnostic?: Record<string, unknown>;
  recommendations?: Record<string, unknown>;
  economics?: Record<string, unknown>;
};

function isValidLead(payload: MaispLeadPayload) {
  const contact = payload.contact;
  if (!contact) return false;
  if (!contact.fullName || contact.fullName.trim().length < 2) return false;
  if (!contact.workEmail || !contact.workEmail.includes("@")) return false;
  if (!contact.companyName || contact.companyName.trim().length < 2) return false;
  if (!contact.roleTitle || contact.roleTitle.trim().length < 2) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MaispLeadPayload;
    if (!isValidLead(payload)) {
      return NextResponse.json(
        { ok: false, message: "Missing required contact fields for lead capture." },
        { status: 400 },
      );
    }

    const leadPacket = {
      source: "buildvora-maisp",
      submittedAt: new Date().toISOString(),
      payload,
    };

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.info("MAISP lead captured without webhook configuration:", leadPacket);
      return NextResponse.json({
        ok: true,
        mode: "local_fallback",
        message: "Lead received, but LEAD_WEBHOOK_URL is not configured.",
      });
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPacket),
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      return NextResponse.json(
        {
          ok: false,
          message: `Lead webhook rejected request (${webhookResponse.status}): ${errorText || "No response body."}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, mode: "webhook" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected error during lead submission.",
      },
      { status: 500 },
    );
  }
}

