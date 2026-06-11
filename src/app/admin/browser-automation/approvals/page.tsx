import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getBrowserAutomationApprovals } from "@/lib/browserAutomationPortal";

export default function AdminApprovalsPage() {
  const approvals = getBrowserAutomationApprovals();

  return (
    <Panel title="Approval queue" kicker="Governance backlog">
      <div className="grid gap-4">
        {approvals.map((approval) => (
          <div key={approval.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{approval.stepLabel}</p>
                <p className="mt-1 text-sm text-slate-500">{approval.workflowSlug} · {approval.runId}</p>
              </div>
              <StatusPill tone="amber">{approval.status}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{approval.context}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Role</p><p className="mt-1">{approval.requiredRole}</p></div>
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Requested From</p><p className="mt-1">{approval.requestedFrom}</p></div>
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Requested At</p><p className="mt-1">{approval.requestedAt}</p></div>
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Expires</p><p className="mt-1">{approval.expiresAt}</p></div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
