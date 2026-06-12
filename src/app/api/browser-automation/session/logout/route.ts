import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/lib/browserAutomationAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  Object.values(SESSION_COOKIE_NAMES).forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
  });

  return response;
}

