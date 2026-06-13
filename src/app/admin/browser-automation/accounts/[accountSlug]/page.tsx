import { notFound } from "next/navigation";
import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import {
  getAccountApprovals,
  getAccountBySlug,
  getAccountConnections,
  getAccountLedger,
  getAccountRuns,
  getAccountWorkflows,
} from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  if (status === "healthy" || status === "completed" || status === "approved") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "pending" || status === "awaiting_approval" || status === "needs_attention") return "amber" as const;
  if (status === "failed" || status === "disconnected" || status === "rejected") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationAdminAccountPage({
  params,
}: {
  params: Promise<{ accountSlug: string }>;
}) {
  const { accountSlug } = await params;
  const account = await getAccountBySlug(accountSlug);

  if (!account) {
    notFound();
  }

  const workflows = await getAccountWorkflows(account.slug);
  const runs = await getAccountRuns(account.slug);
  const approvals = await getAccountApprovals(account.slug);
  const connections = await getAccountConnections(account.slug);
  const ledger = await getAccountLedger(account.slug);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Credits" value={account.availableCredits.toLocaleString()} detail={`${account.softLimitCredits} credit soft-limit buffer remains before overage logic.`} />
        <StatCard label="Active Workflows" value={String(account.activeWorkflows)} detail="Provisioned workflows currently published to the client workspace." />
        <StatCard label="Pending Approvals" value={String(account.pendingApprovals)} detail="Human checkpoints currently blocking or awaiting client decision." />
        <StatCard label="Renewal Date" value={account.renewalDate} detail={`${account.planName} account with ${account.monthlyCredits.toLocaleString()} monthly credits.`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Provisioned workflows" kicker={account.name}>
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{workflow.name}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{workflow.summary}</p>
                  </div>
                  <StatusPill tone={statusTone(workflow.lastRunStatus)}>{workflow.lastRunStatus.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Risk level</p>
                    <p className="mt-1">{workflow.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Version</p>
                    <p className="mt-1">{workflow.latestVersion}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Credit range</p>
                    <p className="mt-1">{workflow.estimatedCredits}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Approvals, connections, and billing posture" kicker="Operational health">
          <div className="grid gap-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">{approval.stepLabel}</p>
                  <StatusPill tone={statusTone(approval.status)}>{approval.status}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{approval.context}</p>
              </div>
            ))}
            {connections.map((connection) => (
              <div key={connection.id} className="rounded-[1.4rem] border border-slate-200 bg-[#f8f8fa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{connection.provider}</p>
                    <p className="mt-1 text-sm text-slate-500">{connection.label}</p>
                  </div>
                  <StatusPill tone={statusTone(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill>
                </div>
              </div>
            ))}
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Recent ledger events</p>
              <div className="mt-3 grid gap-3">
                {ledger.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-[#f8f8fa] px-4 py-3 text-sm text-slate-600">
                    <span>{entry.note}</span>
                    <span>{entry.amount > 0 ? `+${entry.amount}` : entry.amount} credits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Run history" kicker="Execution record">
        <div className="grid gap-4">
          {runs.map((run) => (
            <div key={run.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{run.id}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{run.summary}</p>
                </div>
                <StatusPill tone={statusTone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Requested by</p>
                  <p className="mt-1">{run.requestedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Estimated</p>
                  <p className="mt-1">{run.estimatedCredits} credits</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Actual</p>
                  <p className="mt-1">{run.actualCredits} credits</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Vendor cost</p>
                  <p className="mt-1">${run.vendorCostUsd.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
