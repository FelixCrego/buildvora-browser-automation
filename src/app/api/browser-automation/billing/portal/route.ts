import { NextResponse } from "next/server";
import { createCustomerPortalRedirect } from "@/lib/browserAutomationBilling";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Sign in before managing billing." }, { status: 401 });
    }

    const portal = await createCustomerPortalRedirect({
      session,
      origin: new URL(request.url).origin,
    });
    return NextResponse.json({ ok: true, ...portal });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected billing portal error." },
      { status: 500 },
    );
  }
}
