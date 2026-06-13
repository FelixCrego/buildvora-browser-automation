import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { getWorkspaceAccessDirectory, resolveWorkspaceAccount } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

export default async function BrowserAutomationAccessPage() {
  const session = await getWorkspaceSession();
  const account = await resolveWorkspaceAccount(session);
  const directory = await getWorkspaceAccessDirectory(account.slug, session?.email);

  return (
    <div className="grid gap-6">
      <Panel title="Access and roles" kicker="Who should do what">
        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-slate-950">Current signed-in role</p>
            <div className="mt-3">
              <StatusPill tone={session?.role === "buildvora_admin" ? "blue" : session?.role === "client_admin" ? "green" : session?.role === "approver" ? "amber" : "slate"}>
                {session?.role?.replace(/_/g, " ") ?? "viewer"}
              </StatusPill>
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-relaxed text-slate-600">
              <p>Workspace owners should control billing, publishing, and concurrency.</p>
              <p>Approvers should release sensitive workflow steps and protected actions.</p>
              <p>Operators should launch runs, review evidence, and resolve blockers.</p>
              <p>Viewers should have read-only visibility into status, usage, and outcomes.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="grid grid-cols-[0.95fr_0.95fr_0.8fr_1.3fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Responsibility</span>
            </div>
            {directory.map((entry) => (
              <div key={entry.email} className="grid grid-cols-[0.95fr_0.95fr_0.8fr_1.3fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">{entry.name}</div>
                <div>{entry.email}</div>
                <div>
                  <StatusPill tone={entry.role === "Workspace owner" ? "green" : entry.role === "Approver" ? "amber" : entry.role === "Operator" ? "blue" : "slate"}>
                    {entry.role}
                  </StatusPill>
                </div>
                <div>{entry.responsibility}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Recommended access policy" kicker="Launch governance">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Billing and plan changes", "Workspace owner only"],
            ["Production publish", account.canPublish ? "Workspace owner or BuildVora admin" : "Upgrade required before publish"],
            ["Approval release", "Approver or workspace owner"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

