import Link from "next/link";
import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import {
  getAccountApprovals,
  getBillingAuditEvents,
  getAccountConnections,
  getAccountLedger,
  getAccountRuns,
  getAccountWorkflows,
  resolveWorkspaceAccount,
} from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function toneForStatus(status: string) {
  if (status === "completed" || status === "healthy") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "awaiting_approval" || status === "pending" || status === "needs_attention") return "amber" as const;
  if (status === "failed" || status === "disconnected") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationWorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const showWelcome = params?.welcome === "1";
  const session = await getWorkspaceSession();
  const account = await resolveWorkspaceAccount(session);
  const workflows = await getAccountWorkflows(account.slug);
  const runs = await getAccountRuns(account.slug);
  const approvals = await getAccountApprovals(account.slug);
  const connections = await getAccountConnections(account.slug);
  const ledger = await getAccountLedger(account.slug);
  const billingEvents = await getBillingAuditEvents(account.slug);
  const attentionConnections = connections.filter((connection) => connection.status !== "healthy");

  return (
    <div className="grid gap-6">
      {showWelcome ? (
        <div className="rounded-[1.7rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Payment confirmed. The workspace is unlocked and ready for launches, approvals, and credit-backed execution.
        </div>
      ) : null}
      {account.planType === "trial" ? (
        <div className="rounded-[1.7rem] border border-blue-200 bg-[#f1f7ff] px-5 py-4 text-sm text-slate-700">
          Free trial active. You have {account.trialCreditsRemaining} of {account.trialCreditsTotal} trial credits left through {account.trialExpiresAt?.slice(0, 10)}. Production publishing stays locked until you upgrade.
        </div>
      ) : null}

      <Panel title="What to do next" kicker="First-run path">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Build or choose a workflow",
              detail: "Use the voice builder for a new automation, or open a provisioned workflow and review the estimated credit burn.",
              href: "/workspace/browser-automation/create",
              cta: "Open voice builder",
            },
            {
              title: "Verify billing and credits",
              detail: "Trial users can test immediately. Upgrade when the workflow is ready for production publishing or ongoing runs.",
              href: "/portal/billing",
              cta: "Review billing",
            },
            {
              title: "Check blockers before launch",
              detail: "Look for pending approvals, disconnected integrations, or workflows that still need a final review.",
              href: "/workspace/browser-automation/connections",
              cta: "Review blockers",
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
            >
              <p className="text-sm font-semibold text-slate-950">{card.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.detail}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#0071e3]">{card.cta}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Credits" value={account.availableCredits.toLocaleString()} detail={`${account.monthlyCredits.toLocaleString()} included credits on the ${account.planName} plan.`} />
        <StatCard label="Active Workflows" value={String(workflows.length)} detail="Provisioned browser automations now available to launch from this workspace." />
        <StatCard label="Approval Queue" value={String(approvals.length)} detail="Sensitive steps waiting on your review before execution can continue." />
        <StatCard label={account.planType === "trial" ? "Trial Ends" : "Renewal"} value={account.planType === "trial" ? account.trialExpiresAt?.slice(0, 10) ?? "Pending" : account.renewalDate} detail={account.planType === "trial" ? "Upgrade to publish and keep running after the 3-day trial closes." : "Top-ups and overage billing attach to this renewal cycle."} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="Provisioned workflows" kicker="Run-ready automation">
          <div className="grid gap-4">
            {workflows.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-[#f8fafc] p-6 text-sm leading-relaxed text-slate-600">
                No workflows are provisioned yet. Start with the voice builder to describe the browser task you want automated, then return here to run it.
              </div>
            ) : workflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workspace/browser-automation/workflows/${workflow.slug}`}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{workflow.name}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{workflow.summary}</p>
                  </div>
                  <StatusPill tone={toneForStatus(workflow.lastRunStatus)}>{workflow.lastRunStatus.replace(/_/g, " ")}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Systems</p>
                    <p className="mt-1">{workflow.systems.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Approval policy</p>
                    <p className="mt-1">{workflow.approvalPolicy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Expected burn</p>
                    <p className="mt-1">{workflow.estimatedCredits}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Workspace operations" kicker="Current posture">
          <div className="grid gap-4">
            <Link
              href="/portal/billing"
              className="rounded-[1.4rem] border border-slate-200 bg-[#fff7ed] p-5 transition hover:border-[#0071e3]/25"
            >
              <p className="text-sm font-semibold text-slate-950">Billing and credits</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Manage the active plan, buy top-up credits, and keep the workspace unlocked for protected runs.
              </p>
            </Link>
            <Link
              href="/workspace/browser-automation/create"
              className="rounded-[1.4rem] border border-slate-200 bg-[#f5f9ff] p-5 transition hover:border-[#0071e3]/25"
            >
              <p className="text-sm font-semibold text-slate-950">Voice builder</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Talk through a new workflow, generate a scoped automation plan, and estimate credits before provisioning.
              </p>
            </Link>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Pending approvals</p>
              <div className="mt-3 grid gap-3">
                {approvals.length === 0 ? (
                  <div className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    No approvals are blocking the workspace right now.
                  </div>
                ) : approvals.map((approval) => (
                  <Link
                    key={approval.id}
                    href="/workspace/browser-automation/approvals"
                    className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600 transition hover:border-[#0071e3]/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{approval.stepLabel}</span>
                      <StatusPill tone="amber">pending</StatusPill>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Connections needing attention</p>
              <div className="mt-3 grid gap-3">
                {attentionConnections.length === 0 ? (
                  <div className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    All tracked connections are healthy.
                  </div>
                ) : attentionConnections.map((connection) => (
                    <Link
                      key={connection.id}
                      href="/workspace/browser-automation/connections"
                      className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600 transition hover:border-[#0071e3]/20"
                    >
                      <span>{connection.provider}</span>
                      <StatusPill tone={toneForStatus(connection.status)}>{connection.status.replace(/_/g, " ")}</StatusPill>
                    </Link>
                  ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Latest credit events</p>
              <div className="mt-3 grid gap-3">
                {ledger.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    <span>{entry.note}</span>
                    <span>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Billing activity</p>
              <div className="mt-3 grid gap-3">
                {billingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="rounded-[1rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-950">{event.event}</span>
                      <StatusPill tone={event.event === "billing.activated" ? "green" : "blue"}>{event.actor}</StatusPill>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{event.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Recent runs" kicker="Execution history">
        <div className="grid gap-4">
          {runs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-[#f8fafc] p-6 text-sm leading-relaxed text-slate-600">
              No runs yet. Open a workflow, review the estimate, and launch your first test run from this workspace.
            </div>
          ) : runs.map((run) => (
            <Link
              key={run.id}
              href={`/workspace/browser-automation/runs/${run.id}`}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{run.id}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{run.summary}</p>
                </div>
                <StatusPill tone={toneForStatus(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Approvals</p>
                  <p className="mt-1">{run.approvalsTriggered}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
