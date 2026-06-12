import Link from "next/link";
import ClientLoginForm from "@/components/client-login-form";
import BrowserAutomationApprovalActions from "@/components/browser-automation-approval-actions";
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

export default function PortalPage() {
  const account = getPrimaryWorkspaceAccount();
  const workflows = getAccountWorkflows(account.slug);
  const runs = getAccountRuns(account.slug).slice(0, 3);
  const approvals = getAccountApprovals(account.slug);
  const connections = getAccountConnections(account.slug);
  const ledger = getAccountLedger(account.slug).slice(0, 4);
  const snapshot = getAdminControlPlaneSnapshot();
  const workers = getWorkerNodes();
  const featuredWorkflow = workflows[0];

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.16),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7f9fd_55%,#edf2fa_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="tech text-[10px] uppercase tracking-[0.32em] text-[#0071e3]">BuildVora Browser Automation</p>
              <h1 className="editorial mt-4 max-w-5xl text-[clamp(3.2rem,6vw,6.4rem)] leading-[0.92] tracking-[-0.05em]">
                Client execution and
                <span className="block text-slate-500">admin control in one launch surface.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                This is the actual product view: one place to enter the workspace, launch a browser workflow,
                release approvals, watch credits move, and monitor the backend posture that keeps the system reliable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#client"
                className="inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]"
              >
                Open client surface
              </a>
              <a
                href="#admin"
                className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                View backend controls
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              {
                label: "Available credits",
                value: account.availableCredits.toLocaleString(),
                detail: `${account.planName} live client balance`,
              },
              {
                label: "Active workflows",
                value: String(workflows.length),
                detail: "Provisioned for execution",
              },
              {
                label: "Pending approvals",
                value: String(approvals.length),
                detail: "Human release checkpoints",
              },
              {
                label: "Queue depth",
                value: String(snapshot.totals.queueDepth),
                detail: "Across all workers",
              },
              {
                label: "Active runs",
                value: String(snapshot.totals.activeRuns),
                detail: "Running, queued, or blocked",
              },
              {
                label: "Worker alerts",
                value: String(snapshot.totals.degradedWorkers),
                detail: "Fleet attention required",
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="client" className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-6">
            <div className="rounded-[2.6rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-8">
              <p className="tech text-[10px] uppercase tracking-[0.32em] text-[#0071e3]">Client Entry</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Signed client access and workflow runtime.</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                The client is not buying a file. They are getting a provisioned workspace with runnable
                automation, guarded approvals, evidence capture, connection health, and credits-based execution.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  "Voice intake can scope the automation before provisioning.",
                  "Launches reserve credits before work starts.",
                  "Protected steps pause until a human releases them.",
                  "Run evidence and billing settle back into the workspace automatically.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.3rem] border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <ClientLoginForm />
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2.6rem] border border-slate-200 bg-[#07111d] p-7 text-white shadow-[0_30px_80px_rgba(2,6,23,0.26)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="tech text-[10px] uppercase tracking-[0.3em] text-cyan-200">Featured workflow</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{featuredWorkflow?.name}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">{featuredWorkflow?.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={riskTone(featuredWorkflow?.riskLevel ?? "low")}>{featuredWorkflow?.riskLevel} risk</StatusPill>
                  <StatusPill tone="blue">{featuredWorkflow?.estimatedCredits}</StatusPill>
                </div>
              </div>

              {featuredWorkflow ? (
                <div className="mt-7">
                  <BrowserAutomationLaunchSimulator workflowSlug={featuredWorkflow.slug} />
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {workflows.slice(0, 4).map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/workspace/browser-automation/workflows/${workflow.slug}`}
                  className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition hover:border-[#0071e3]/20 hover:bg-[#f7fbff]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{workflow.name}</p>
                    <StatusPill tone={tone(workflow.lastRunStatus)}>{workflow.lastRunStatus.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{workflow.summary}</p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    {workflow.systems.join(" / ")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 md:px-10">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[2.4rem] border border-slate-200 bg-white p-7 shadow-[0_22px_65px_rgba(15,23,42,0.07)] md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.3em] text-[#0071e3]">Approval Inbox</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Release protected steps.</h3>
              </div>
              <Link
                href="/workspace/browser-automation/approvals"
                className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                Full inbox
              </Link>
            </div>
            <div className="mt-6 grid gap-4">
              {approvals.length === 0 ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] px-5 py-4 text-sm text-slate-600">
                  No approvals are currently waiting on human release.
                </div>
              ) : (
                approvals.map((approval) => (
                  <article key={approval.id} className="rounded-[1.6rem] border border-slate-200 bg-[#fbfcff] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{approval.stepLabel}</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{approval.context}</p>
                      </div>
                      <StatusPill tone="amber">{approval.status}</StatusPill>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                      <div>{approval.runId}</div>
                      <div>{approval.requestedFrom}</div>
                      <div>{approval.expiresAt}</div>
                    </div>
                    <BrowserAutomationApprovalActions
                      approvalId={approval.id}
                      fallbackApprover={approval.requestedFrom}
                    />
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-slate-200 bg-white p-7 shadow-[0_22px_65px_rgba(15,23,42,0.07)] md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.3em] text-[#0071e3]">Live execution</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Recent runs and credits.</h3>
              </div>
              <Link
                href="/workspace/browser-automation"
                className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                Open workspace
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {runs.map((run) => (
                <Link
                  key={run.id}
                  href={`/workspace/browser-automation/runs/${run.id}`}
                  className="rounded-[1.6rem] border border-slate-200 bg-[#fbfcff] p-5 transition hover:border-[#0071e3]/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{run.id}</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">{run.summary}</p>
                    </div>
                    <StatusPill tone={tone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-4">
                    <div>{run.requestedBy}</div>
                    <div>{run.estimatedCredits} est.</div>
                    <div>{run.actualCredits} actual</div>
                    <div>{run.queueLane}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-[#f8fafc] p-5">
              <p className="text-sm font-semibold text-slate-950">Latest credit movements</p>
              <div className="mt-4 grid gap-3">
                {ledger.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white px-4 py-3 text-sm text-slate-600">
                    <span>{entry.note}</span>
                    <span className="font-semibold text-slate-950">{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="admin" className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="rounded-[2.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] p-7 shadow-[0_28px_80px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tech text-[10px] uppercase tracking-[0.32em] text-[#0071e3]">Admin backend</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Operations command board for launch.</h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                The backend needs to feel like software, not a brochure. This command surface shows the exact posture
                that matters at launch: queue pressure, worker health, approvals, connection risk, and live billing flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/browser-automation/runs" className="rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]">
                Run controls
              </Link>
              <Link href="/admin/browser-automation/workers" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Worker fleet
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Accounts", value: String(snapshot.totals.accounts), detail: "Provisioned client tenants" },
              { label: "Workflows", value: String(snapshot.totals.workflows), detail: "Draft and published automations" },
              { label: "Monthly revenue", value: `$${snapshot.totals.monthlyRevenue.toLocaleString()}`, detail: "Live commercial posture" },
              { label: "Disconnected connections", value: String(snapshot.totals.disconnectedConnections), detail: "Blocking execution dependencies" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Live run queue</h3>
                <Link href="/admin/browser-automation" className="text-sm font-semibold text-[#0071e3]">
                  Full backend
                </Link>
              </div>
              <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-slate-200">
                <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 bg-[#f5f5f7] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Run</span>
                  <span>Account</span>
                  <span>Worker</span>
                  <span>Status</span>
                  <span>Credits</span>
                </div>
                {snapshot.runs.slice(0, 5).map((run) => (
                  <div key={run.id} className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-950">{run.id}</p>
                      <p className="mt-1 text-slate-500">{run.workflowSlug}</p>
                    </div>
                    <div>{run.accountSlug}</div>
                    <div>{run.workerId}</div>
                    <div>
                      <StatusPill tone={tone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
                    </div>
                    <div>{run.actualCredits}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Worker fleet</h3>
                <div className="mt-5 grid gap-4">
                  {workers.map((worker) => (
                    <div key={worker.id} className="rounded-[1.4rem] border border-slate-200 bg-[#fbfcff] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{worker.label}</p>
                        <StatusPill tone={tone(worker.status)}>{worker.status}</StatusPill>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                        <div>{worker.region}</div>
                        <div>{worker.runtime}</div>
                        <div>{worker.activeRuns} active</div>
                        <div>{worker.queueDepth} queued</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Connection health</h3>
                <div className="mt-5 grid gap-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200 bg-[#fbfcff] px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-950">{connection.provider}</p>
                        <p className="mt-1 text-sm text-slate-500">{connection.label}</p>
                      </div>
                      <StatusPill tone={tone(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
