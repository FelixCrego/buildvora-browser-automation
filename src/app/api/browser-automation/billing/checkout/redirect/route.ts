import { NextResponse } from "next/server";
import { createCheckoutRedirect } from "@/lib/browserAutomationBilling";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";

export async function GET(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session) {
      return NextResponse.redirect(new URL("/portal/client/login", request.url), 307);
    }

    const url = new URL(request.url);
    const planId = url.searchParams.get("planId");
    const couponCode = url.searchParams.get("couponCode");

    if (!planId) {
      return NextResponse.redirect(new URL("/portal/billing?error=missing_plan", request.url), 307);
    }

    const checkout = await createCheckoutRedirect({
      planId,
      session,
      origin: url.origin,
      couponCode,
    });

    return NextResponse.redirect(checkout.url, 307);
  } catch {
    return NextResponse.redirect(new URL("/portal/billing?error=checkout_failed", request.url), 307);
  }
}
