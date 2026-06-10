import { NextResponse } from "next/server";
import {
  getAccountApprovals,
  getAccountBySlug,
  getAccountConnections,
  getAccountLedger,
  getAccountRuns,
  getAccountWorkflows,
} from "@/lib/browserAutomationPortal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountSlug: string }> },
) {
  const { accountSlug } = await params;
  const account = getAccountBySlug(accountSlug);

  if (!account) {
    return NextResponse.json({ ok: false, message: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    account,
    workflows: getAccountWorkflows(accountSlug),
    runs: getAccountRuns(accountSlug),
    approvals: getAccountApprovals(accountSlug),
    connections: getAccountConnections(accountSlug),
    ledger: getAccountLedger(accountSlug),
  });
}
