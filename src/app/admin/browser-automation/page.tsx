import Link from "next/link";
import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import { getAdminControlPlaneSnapshot } from "@/lib/browserAutomationPortal";

function runTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "awaiting_approval") return "amber" as const;
  if (status === "failed") return "red" as const;
  return "slate" as const;
}

export default function BrowserAutomationAdminPage() {
  const snapshot = getAdminControlPlaneSnapshot();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts" value={String(snapshot.totals.accounts)} detail="Signed client workspaces currently provisioned for browser automation." />
        <StatCard label="Active Runs" value={String(snapshot.totals.activeRuns)} detail="Queued, running, or approval-blocked workflows across client accounts." />
        <StatCard label="Credits Available" value={snapshot.totals.totalCreditsAvailable.toLocaleString()} detail="Aggregate client credit balance available before soft-limit intervention." />
        <StatCard label="Monthly Revenue" value={`$${snapshot.totals.monthlyRevenue.toLocaleString()}`} detail="Current run-rate billed through subscription and credits usage." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Account portfolio" kicker="Commercial posture">
          <div className="grid gap-4">
            {snapshot.accounts.map((account) => (
              <Link
                key={account.id}
                href={`/admin/browser-automation/accounts/${account.slug}`}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-5 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{account.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{account.vertical}</p>
                  </div>
                  <StatusPill tone={account.pendingApprovals > 0 ? "amber" : "green"}>
                    {account.pendingApprovals > 0 ? `${account.pendingApprovals} approvals pending` : "approval queue clear"}
                  </StatusPill>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Plan</p>
                    <p className="mt-1">{account.planName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Credits</p>
                    <p className="mt-1">{account.availableCredits.toLocaleString()} available</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Workflows</p>
                    <p className="mt-1">{account.activeWorkflows} active</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Monthly billings</p>
                    <p className="mt-1">${account.monthlySpendUsd.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Approval and run pressure" kicker="Operations load">
          <div className="grid gap-4">
            {snapshot.runs.slice(0, 3).map((run) => (
              <div key={run.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{run.id}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{run.summary}</p>
                  </div>
                  <StatusPill tone={runTone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Estimated</p>
                    <p className="mt-1">{run.estimatedCredits} credits</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Actual so far</p>
                    <p className="mt-1">{run.actualCredits} credits</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Vendor cost</p>
                    <p className="mt-1">${run.vendorCostUsd.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-[1.4rem] border border-dashed border-[#0071e3]/25 bg-[#f5f9ff] p-5">
              <p className="text-sm font-semibold text-slate-950">Backend seam</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This admin surface is ready to sit on top of Postgres, Stripe webhooks, and queued worker telemetry. The seeded UI already matches the control-plane objects the backend will need.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
