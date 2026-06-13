import { NextResponse } from "next/server";
import { activateAccountBilling, getAccountBySlug, grantCreditsToAccount } from "@/lib/browserAutomationPortal";
import { resolveCheckoutActivation } from "@/lib/browserAutomationBilling";
import { applyWorkspaceAccountCookies, getWorkspaceSession, SESSION_COOKIE_NAMES } from "@/lib/browserAutomationAuth";

type ActivatePayload = {
  planId?: string;
  token?: string | null;
  subscriptionId?: string | null;
  couponCode?: string | null;
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
      token: payload.token ?? null,
      subscriptionId: payload.subscriptionId ?? null,
      couponCode: payload.couponCode ?? null,
    });

    await activateAccountBilling({
      accountSlug: session.accountSlug,
      billingPlan: activation.billingPlan,
      actor: "billing",
      note:
        activation.source === "coupon"
          ? `${activation.billingPlan} plan unlocked by ${payload.couponCode ?? "internal"} test coupon.`
          : `${activation.billingPlan} plan confirmed from ${activation.source === "paypal" ? "PayPal" : "review mode"}.`,
      externalRef: activation.billingReferenceId ?? undefined,
    });

    if (activation.creditsToGrant > 0) {
      await grantCreditsToAccount({
        accountSlug: session.accountSlug,
        amount: activation.creditsToGrant,
        note: `${payload.planId === "topup" ? "Credit top-up" : "Plan activation"} settled via ${activation.source}.`,
        actor: "billing",
        externalRef: activation.billingReferenceId ?? undefined,
      });
    }

    const response = NextResponse.json({
      ok: true,
      nextPath: "/workspace/browser-automation?welcome=1",
      activation,
    });

    response.cookies.set(SESSION_COOKIE_NAMES.billingStatus, activation.billingStatus, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingPlan, activation.billingPlan, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(
      SESSION_COOKIE_NAMES.billingProvider,
      activation.source === "paypal" ? "paypal" : activation.source === "coupon" ? "coupon" : "demo",
      { httpOnly: true, sameSite: "lax", path: "/" },
    );
    response.cookies.set(SESSION_COOKIE_NAMES.billingReferenceId, activation.billingReferenceId ?? "", { httpOnly: true, sameSite: "lax", path: "/" });
    const account = await getAccountBySlug(session.accountSlug);
    if (account) {
      applyWorkspaceAccountCookies(response, account);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected activation error." },
      { status: 500 },
    );
  }
}
