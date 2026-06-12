import { NextResponse } from "next/server";
import { createCheckoutRedirect } from "@/lib/browserAutomationBilling";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";

type CheckoutPayload = {
  planId?: string;
  couponCode?: string | null;
};

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Sign in before starting billing." }, { status: 401 });
    }

    const payload = (await request.json()) as CheckoutPayload;
    if (!payload.planId) {
      return NextResponse.json({ ok: false, message: "planId is required." }, { status: 400 });
    }

    const checkout = await createCheckoutRedirect({
      planId: payload.planId,
      session,
      origin: new URL(request.url).origin,
      couponCode: payload.couponCode ?? null,
    });

    return NextResponse.json({ ok: true, ...checkout });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected billing checkout error." },
      { status: 500 },
    );
  }
}
