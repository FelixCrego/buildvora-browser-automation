import { NextResponse } from "next/server";
import { grantCreditsToAccount } from "@/lib/browserAutomationPortal";
import { resolveCheckoutActivation } from "@/lib/browserAutomationBilling";
import { getWorkspaceSession, SESSION_COOKIE_NAMES } from "@/lib/browserAutomationAuth";

type ActivatePayload = {
  planId?: string;
  sessionId?: string | null;
};

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Sign in before activating billing." }, { status: 401 });
    }

    const payload = (await request.json()) as ActivatePayload;
    if (!payload.planId) {
      return NextResponse.json({ ok: false, message: "planId is required." }, { status: 400 });
    }

    const activation = await resolveCheckoutActivation({
      planId: payload.planId,
      sessionId: payload.sessionId ?? null,
    });

    if (activation.creditsToGrant > 0) {
      grantCreditsToAccount({
        accountSlug: session.accountSlug,
        amount: activation.creditsToGrant,
        note: `${payload.planId === "topup" ? "Credit top-up" : "Plan activation"} settled via ${activation.source}.`,
        actor: "billing",
      });
    }

    const response = NextResponse.json({
      ok: true,
      nextPath: "/workspace/browser-automation",
      activation,
    });

    response.cookies.set(SESSION_COOKIE_NAMES.billingStatus, activation.billingStatus, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingPlan, activation.billingPlan, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.stripeCustomerId, activation.stripeCustomerId ?? "", { httpOnly: true, sameSite: "lax", path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected activation error." },
      { status: 500 },
    );
  }
}

