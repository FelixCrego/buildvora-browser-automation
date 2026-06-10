import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getAccountApprovals, getPrimaryWorkspaceAccount } from "@/lib/browserAutomationPortal";

export default function BrowserAutomationApprovalsPage() {
  const account = getPrimaryWorkspaceAccount();
  const approvals = getAccountApprovals(account.slug);

  return (
    <div className="grid gap-6">
      <Panel title="Approval Inbox" kicker="Human release points">
        <div className="grid gap-4">
          {approvals.map((approval) => (
            <article key={approval.id} className="rounded-[1.6rem] border border-white/10 bg-white/4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{approval.stepLabel}</p>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{approval.context}</p>
                </div>
                <StatusPill tone="amber">{approval.status}</StatusPill>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Run</p>
                  <p className="mt-1">{approval.runId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Approver</p>
                  <p className="mt-1">{approval.requestedFrom}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Expires</p>
                  <p className="mt-1">{approval.expiresAt}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Approve and Continue
                </button>
                <button
                  type="button"
                  className="inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/18"
                >
                  Reject Step
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
