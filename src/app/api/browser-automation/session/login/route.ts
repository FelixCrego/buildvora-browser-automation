import { NextResponse } from "next/server";
import { buildWorkspaceSession, SESSION_COOKIE_NAMES } from "@/lib/browserAutomationAuth";

type LoginPayload = {
  email?: string;
  workspaceCode?: string;
};

function isValidEmail(email: string) {
  return email.includes("@");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const email = payload.email?.trim().toLowerCase() ?? "";
    const workspaceCode = payload.workspaceCode?.trim().toUpperCase() ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Enter a valid work email." }, { status: 400 });
    }

    if (workspaceCode.length < 6) {
      return NextResponse.json({ ok: false, message: "Enter a valid workspace code." }, { status: 400 });
    }

    const session = buildWorkspaceSession({ email, workspaceCode });
    const nextPath = "/portal/billing";
    const response = NextResponse.json({ ok: true, nextPath, session });

    response.cookies.set(SESSION_COOKIE_NAMES.email, session.email, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.workspaceCode, session.workspaceCode, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.accountSlug, session.accountSlug, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingStatus, session.billingStatus, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingPlan, session.billingPlan ?? "", { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingProvider, session.billingProvider, { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.billingReferenceId, session.billingReferenceId ?? "", { httpOnly: true, sameSite: "lax", path: "/" });
    response.cookies.set(SESSION_COOKIE_NAMES.signedInAt, session.signedInAt, { httpOnly: true, sameSite: "lax", path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected login error." },
      { status: 500 },
    );
  }
}
