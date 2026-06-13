import Link from "next/link";
import ClientLoginForm from "@/components/client-login-form";
import BrowserAutomationApprovalActions from "@/components/browser-automation-approval-actions";
import {
  PortalConnectionOpsPanel,
  PortalRunOpsTable,
  PortalWorkerOpsTable,
} from "@/components/browser-automation-portal-ops";
import BrowserAutomationLaunchSimulator from "@/components/browser-automation-launch-simulator";
import { StatusPill } from "@/components/browser-automation-console";
import {
  getAccountApprovals,
  getAccountConnections,
  getAccountLedger,
  getAccountRuns,
  getAccountWorkflows,
  getAdminControlPlaneSnapshot,
  getPrimaryWorkspaceAccount,
  getWorkerNodes,
} from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function tone(status: string) {
  if (status === "completed" || status === "healthy" || status === "active") return "green" as const;
  if (status === "running") return "blue" as const;
  if (
    status === "awaiting_approval" ||
    status === "pending" ||
    status === "paused" ||
    status === "degraded" ||
    status === "needs_attention"
  ) {
    return "amber" as const;
  }
  if (status === "failed" || status === "offline" || status === "disconnected" || status === "critical") {
    return "red" as const;
  }
  return "slate" as const;
}

function riskTone(riskLevel: string) {
  if (riskLevel === "high") return "amber" as const;
  if (riskLevel === "medium") return "blue" as const;
  return "green" as const;
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <p className="tech text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p>
    </article>
  );
}

function StepCard({
  step,
  title,
  note,
}: {
  step: string;
  title: string;
  note: string;
}) {
  return (
    <article className="rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <p className="tech text-[10px] uppercase tracking-[0.22em] text-[#0071e3]">{step}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{note}</p>
    </article>
  );
}

export default async function PortalPage() {
  const account = await getPrimaryWorkspaceAccount();
  const workflows = await getAccountWorkflows(account.slug);
  const runs = await getAccountRuns(account.slug);
  const approvals = await getAccountApprovals(account.slug);
  const connections = await getAccountConnections(account.slug);
  const ledger = await getAccountLedger(account.slug);
  const snapshot = await getAdminControlPlaneSnapshot();
  const workers = await getWorkerNodes();
  const featuredWorkflow = workflows[0];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="tech text-[10px] uppercase tracking-[0.24em] text-sky-700">BuildVora Browser Automation</p>
              <h1 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950 md:text-[1.9rem]">
                Browser automation workspace
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
                Launch workflows, monitor credits, review approvals, and step into operations from one software surface.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Client + admin
              </span>
              <Link
                href="/workspace/browser-automation"
                className="inline-flex rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111c33]"
              >
                Open workspace
              </Link>
              <Link
                href="/admin/browser-automation"
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Open admin
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Credits" value={account.availableCredits.toLocaleString()} note={account.planName} />
            <MetricCard label="Workflows" value={String(workflows.length)} note="Provisioned and launchable" />
            <MetricCard label="Approvals" value={String(approvals.length)} note="Waiting on release" />
            <MetricCard label="Active runs" value={String(snapshot.totals.activeRuns)} note="Running, queued, blocked" />
            <MetricCard label="Queue depth" value={String(snapshot.totals.queueDepth)} note="Across worker fleet" />
            <MetricCard label="Worker alerts" value={String(snapshot.totals.degradedWorkers)} note="Operator attention" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <StepCard step="1. Access" title="Sign in or start the trial" note="New workspaces begin with 25 trial credits for building and test runs." />
            <StepCard step="2. Build" title="Use voice or choose a workflow" note="Customers can describe a workflow, review the scope, and see the estimated burn." />
            <StepCard step="3. Run" title="Launch with clear credit usage" note="Protected actions pause for approval and final credits settle after the run ends." />
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-wrap gap-2 px-6 py-3 md:px-8">
          {[
            ["#launch", "Launch"],
            ["#approvals", "Approvals"],
            ["#runs", "Runs"],
            ["#ops", "Ops"],
            ["#access", "Access"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-slate-200 bg-[#f7f8fb] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0071e3]/20 hover:bg-[#f2f8ff] hover:text-[#0071e3]"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-[1320px] gap-6 px-6 py-6 md:px-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <section id="launch" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Launch desk</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{featuredWorkflow?.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{featuredWorkflow?.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={riskTone(featuredWorkflow?.riskLevel ?? "low")}>{featuredWorkflow?.riskLevel} risk</StatusPill>
                <StatusPill tone="blue">{featuredWorkflow?.estimatedCredits}</StatusPill>
                <StatusPill tone={tone(featuredWorkflow?.lastRunStatus ?? "slate")}>{featuredWorkflow?.lastRunStatus.replace(/_/g, " ")}</StatusPill>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-4">
                {featuredWorkflow ? <BrowserAutomationLaunchSimulator workflowSlug={featuredWorkflow.slug} /> : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">Workflow matrix</p>
                  <Link href="/workspace/browser-automation" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
                    Full workspace
                  </Link>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white">
                  <div className="grid grid-cols-[1.1fr_0.72fr_0.72fr] gap-3 bg-[#f5f5f7] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    <span>Workflow</span>
                    <span>Status</span>
                    <span>Credits</span>
                  </div>
                  {workflows.slice(0, 5).map((workflow) => (
                    <Link
                      key={workflow.id}
                      href={`/workspace/browser-automation/workflows/${workflow.slug}`}
                      className="grid grid-cols-[1.1fr_0.72fr_0.72fr] gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 transition hover:bg-[#f8fbff]"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{workflow.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{workflow.systems.join(" / ")}</p>
                      </div>
                      <div className="self-center">
                        <StatusPill tone={tone(workflow.lastRunStatus)}>{workflow.lastRunStatus.replace(/_/g, " ")}</StatusPill>
                      </div>
                      <div className="self-center text-slate-950">{workflow.estimatedCredits}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="approvals" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Approval queue</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Protected actions waiting on release</h2>
              </div>
              <Link href="/workspace/browser-automation/approvals" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Full inbox
              </Link>
            </div>

            <div className="mt-5 grid gap-4">
              {approvals.length === 0 ? (
                <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] px-5 py-4 text-sm text-slate-600">
                  No approvals are currently blocking execution.
                </div>
              ) : (
                approvals.map((approval) => (
                  <article key={approval.id} className="rounded-[1.5rem] border border-slate-200 bg-[#fbfcff] p-5">
                    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{approval.stepLabel}</p>
                          <StatusPill tone="amber">{approval.status}</StatusPill>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{approval.context}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-500">
                        <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                          <span>Run</span>
                          <span className="font-semibold text-slate-950">{approval.runId}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                          <span>Requested from</span>
                          <span className="font-semibold text-slate-950">{approval.requestedFrom}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                          <span>Expires</span>
                          <span className="font-semibold text-slate-950">{approval.expiresAt}</span>
                        </div>
                      </div>
                    </div>
                    <BrowserAutomationApprovalActions approvalId={approval.id} fallbackApprover={approval.requestedFrom} />
                  </article>
                ))
              )}
            </div>
          </section>

          <section id="runs" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Execution ledger</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Runs, credit settlement, and operator controls</h2>
              </div>
              <Link href="/workspace/browser-automation" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Workspace detail
              </Link>
            </div>

            <PortalRunOpsTable runs={runs} />

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-4">
                <p className="text-sm font-semibold text-slate-950">Latest credit movements</p>
                <div className="mt-4 grid gap-3">
                  {ledger.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3 text-sm text-slate-600">
                      <span>{entry.note}</span>
                      <span className="font-semibold text-slate-950">{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <PortalConnectionOpsPanel connections={connections} />
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section id="ops" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Operations backend</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Queue, workers, and commercial posture</h2>
              </div>
              <Link href="/admin/browser-automation" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Full control plane
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <MetricCard label="Accounts" value={String(snapshot.totals.accounts)} note="Provisioned tenants" />
              <MetricCard label="Revenue" value={`$${snapshot.totals.monthlyRevenue.toLocaleString()}`} note="Live monthly value" />
              <MetricCard label="Drafts" value={String(snapshot.totals.drafts)} note="Awaiting release" />
              <MetricCard label="Disconnected" value={String(snapshot.totals.disconnectedConnections)} note="Execution blockers" />
            </div>

            <PortalWorkerOpsTable workers={workers} />

            <div className="mt-5 grid gap-3">
              {snapshot.auditEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="rounded-[1.2rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{event.event}</p>
                    <StatusPill tone={tone(event.severity)}>{event.severity}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="access" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Access</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Client access and next steps</h2>
            </div>

            <div className="mt-5">
              <ClientLoginForm />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ["/workspace/browser-automation/create", "Voice builder", "Scope new workflows"],
                ["/portal/billing", "Billing", "Paywall and credits"],
                ["/workspace/browser-automation/connections", "Connections", "Credential review"],
                ["/admin/browser-automation/runs", "Run controls", "Queue operations"],
                ["/admin/browser-automation/credits", "Credits ledger", "Audit billing movement"],
              ].map(([href, label, detail]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-[1.2rem] border border-slate-200 bg-[#f8fafc] px-4 py-4 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
                >
                  <p className="font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
