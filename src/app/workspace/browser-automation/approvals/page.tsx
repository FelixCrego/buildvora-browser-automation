import { Panel, StatusPill } from "@/components/browser-automation-console";
import BrowserAutomationApprovalActions from "@/components/browser-automation-approval-actions";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { getAccountApprovals, resolveWorkspaceAccount } from "@/lib/browserAutomationPortal";

export default async function BrowserAutomationApprovalsPage() {
  const session = await getWorkspaceSession();
  const account = await resolveWorkspaceAccount(session);
  const approvals = await getAccountApprovals(account.slug);

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
              <BrowserAutomationApprovalActions
                approvalId={approval.id}
                fallbackApprover={approval.requestedFrom}
              />
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
