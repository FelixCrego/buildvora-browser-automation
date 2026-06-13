import Link from "next/link";
import ClientLoginForm from "@/components/client-login-form";
import BrowserAutomationApprovalActions from "@/components/browser-automation-approval-actions";
import {
  PortalRunOpsTable,
} from "@/components/browser-automation-portal-ops";
import BrowserAutomationLaunchSimulator from "@/components/browser-automation-launch-simulator";
import { StatusPill } from "@/components/browser-automation-console";
import {
  getAccountApprovals,
  getAccountLedger,
  getAccountRuns,
  getAccountWorkflows,
  getPrimaryWorkspaceAccount,
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

function TrialValueRow({
  label,
  credits,
  widthClass,
  note,
}: {
  label: string;
  credits: string;
  widthClass: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="text-sm font-semibold text-sky-700">{credits}</p>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-slate-100">
        <div className={`h-2.5 rounded-full bg-[linear-gradient(90deg,#0071e3_0%,#38bdf8_100%)] ${widthClass}`} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{note}</p>
    </div>
  );
}

export default async function PortalPage() {
  const account = await getPrimaryWorkspaceAccount();
  const workflows = await getAccountWorkflows(account.slug);
  const runs = await getAccountRuns(account.slug);
  const approvals = await getAccountApprovals(account.slug);
  const ledger = await getAccountLedger(account.slug);
  const featuredWorkflow = workflows[0];
  const pendingApprovals = approvals.slice(0, 2);
  const latestLedger = ledger.slice(0, 4);
  const recentRuns = runs.slice(0, 6);

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
                A single control surface for trial, workflow build, approvals, runs, and credit visibility.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                3-day free trial
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                25 credits included
              </span>
              <Link
                href="/portal/client/login"
                className="inline-flex rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111c33]"
              >
                Start free trial
              </Link>
              <Link
                href="/workspace/browser-automation"
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Open workspace
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Overview</p>
              <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-slate-950">
                Trial to production in one workspace
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                New customers should immediately understand three things: what the trial includes, what they should do next, and how to tell if the workflow is worth paying for.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MetricCard label="Credits" value={account.availableCredits.toLocaleString()} note={account.planName} />
                <MetricCard label="Workflows" value={String(workflows.length)} note="Provisioned and launchable" />
                <MetricCard label="Approvals" value={String(approvals.length)} note="Need your release" />
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  ["1. Start free", "A new workspace gets 25 credits across 3 days, with no card required up front."],
                  ["2. Build the workflow", "Use voice or a structured path to create the first automation draft."],
                  ["3. Validate with tests", "Use the trial to prove selectors, approvals, and repeatability before upgrade."],
                ].map(([title, note]) => (
                  <div key={title} className="rounded-[1rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Next run</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{featuredWorkflow?.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{featuredWorkflow?.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={riskTone(featuredWorkflow?.riskLevel ?? "low")}>{featuredWorkflow?.riskLevel} risk</StatusPill>
                  <StatusPill tone="blue">{featuredWorkflow?.estimatedCredits}</StatusPill>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-[#0f172a] p-4">
                {featuredWorkflow ? <BrowserAutomationLaunchSimulator workflowSlug={featuredWorkflow.slug} /> : null}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">What 25 credits gets you</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">$25 of usable product value</h2>
                </div>
                <span className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  trial runway
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <TrialValueRow label="Workflow build from voice" credits="5 credits" widthClass="w-[20%]" note="Create the automation draft with a real scope and estimate." />
                <TrialValueRow label="Light test run" credits="10 credits" widthClass="w-[40%]" note="Validate selectors, approvals, and the first browser path." />
                <TrialValueRow label="Second test or standard run" credits="10 to 18 credits" widthClass="w-[72%]" note="Use the remaining budget to confirm repeatability or attempt a richer run." />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">First 72 hours</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Keep the path obvious</h2>
              <div className="mt-4 grid gap-3">
                {[
                  ["Hour 0", "Sign in and open the free workspace."],
                  ["Day 1", "Generate the workflow draft and review the estimate."],
                  ["Day 2", "Run one or two meaningful tests."],
                  ["Day 3", "Upgrade only if the workflow deserves production."],
                ].map(([time, note]) => (
                  <div key={time} className="rounded-[1rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">{time}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Trial checkpoint</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Know when it is worth upgrading</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Workflow draft is clear</p>
                  <p className="mt-1 text-sm text-slate-600">The scope and estimated credits make sense before launch.</p>
                </div>
                <div className="rounded-[1rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">At least one test completed</p>
                  <p className="mt-1 text-sm text-slate-600">Use the trial to validate the browser path and approval flow.</p>
                </div>
                <div className="rounded-[1rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Repeatability is proven</p>
                  <p className="mt-1 text-sm text-slate-600">Upgrade when the workflow is reliable enough for production use.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1320px] gap-6 px-6 py-6 md:px-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Recent activity</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Your latest runs and credit usage</h2>
              </div>
              <Link href="/workspace/browser-automation" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Workspace detail
              </Link>
            </div>

            <PortalRunOpsTable runs={recentRuns} />

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-4">
                <p className="text-sm font-semibold text-slate-950">Latest credit movements</p>
                <div className="mt-4 grid gap-3">
                  {latestLedger.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3 text-sm text-slate-600">
                      <span>{entry.note}</span>
                      <span className="font-semibold text-slate-950">{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Approvals</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Protected actions waiting on release</h2>
              </div>
              <Link href="/workspace/browser-automation/approvals" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Full inbox
              </Link>
            </div>

            <div className="mt-5 grid gap-4">
              {pendingApprovals.length === 0 ? (
                <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] px-5 py-4 text-sm text-slate-600">
                  No approvals are currently blocking execution.
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <article key={approval.id} className="rounded-[1.4rem] border border-slate-200 bg-[#fbfcff] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base font-semibold text-slate-950">{approval.stepLabel}</p>
                      <StatusPill tone="amber">{approval.status}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{approval.context}</p>
                    <div className="mt-4 grid gap-2 text-sm text-slate-500">
                      <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                        <span>Run</span>
                        <span className="font-semibold text-slate-950">{approval.runId}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                        <span>Requested from</span>
                        <span className="font-semibold text-slate-950">{approval.requestedFrom}</span>
                      </div>
                    </div>
                    <BrowserAutomationApprovalActions approvalId={approval.id} fallbackApprover={approval.requestedFrom} />
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Workflows</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Choose where to continue</h2>
              </div>
              <Link href="/workspace/browser-automation" className="rounded-full border border-slate-200 bg-[#f5f5f7] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]">
                Full workspace
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {workflows.slice(0, 4).map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/workspace/browser-automation/workflows/${workflow.slug}`}
                  className="rounded-[1.2rem] border border-slate-200 bg-[#f8fafc] px-4 py-4 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{workflow.name}</p>
                    <StatusPill tone={tone(workflow.lastRunStatus)}>{workflow.lastRunStatus.replace(/_/g, " ")}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{workflow.systems.join(" / ")}</p>
                  <p className="mt-2 text-sm font-medium text-sky-700">{workflow.estimatedCredits}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
