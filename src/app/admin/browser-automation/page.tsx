import Link from "next/link";
import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import {
  getAdminControlPlaneSnapshot,
  getAdminEconomicsSnapshot,
  getBrowserAutomationRuns,
} from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function tone(status: string) {
  if (status === "completed" || status === "healthy" || status === "active") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "awaiting_approval" || status === "pending" || status === "paused" || status === "degraded") return "amber" as const;
  if (status === "failed" || status === "offline" || status === "critical") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationAdminPage() {
  const snapshot = await getAdminControlPlaneSnapshot();
  const economics = await getAdminEconomicsSnapshot();
  const recentRuns = (await getBrowserAutomationRuns()).slice(0, 4);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Queue Depth" value={String(snapshot.totals.queueDepth)} detail="Queued work waiting across priority, standard, and nightly lanes." />
        <StatCard label="Active Runs" value={String(snapshot.totals.activeRuns)} detail="Running, paused, queued, or approval-blocked executions." />
        <StatCard label="Worker Alerts" value={String(snapshot.totals.degradedWorkers)} detail="Workers requiring intervention before throughput or reliability degrades further." />
        <StatCard label="Draft Workflows" value={String(snapshot.totals.drafts)} detail="Unpublished workflow versions awaiting release review or credential readiness." />
        <StatCard label="Credits Available" value={snapshot.totals.totalCreditsAvailable.toLocaleString()} detail="Aggregate client balance before soft-limit and overage rules apply." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="MRR" value={`$${economics.totals.mrrUsd.toLocaleString()}`} detail="Plan revenue at the current account mix." />
        <StatCard label="Trial Accounts" value={String(economics.totals.trialAccounts)} detail="Self-serve workspaces still inside the 3-day trial." />
        <StatCard label="Trial → Paid" value={`${economics.totals.trialToPaidConversionRate}%`} detail="Current conversion mix based on active paid vs trial accounts." />
        <StatCard label="Credits Burned" value={economics.totals.creditsBurned.toLocaleString()} detail="Settled run usage across all accounts." />
        <StatCard label="Avg Revenue / Run" value={`$${economics.totals.averageRevenuePerRunUsd}`} detail="Estimated revenue equivalent based on plan credit value." />
        <StatCard label="Gross Margin" value={`$${economics.totals.grossMarginUsd.toLocaleString()}`} detail="Estimated revenue minus vendor cost across completed runs." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Operations command board" kicker="Immediate controls">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { href: "/admin/browser-automation/runs", label: "Run queue controls", text: "Pause, cancel, retry, and re-lane active runs by worker or account.", tone: "blue" },
              { href: "/admin/browser-automation/workflows", label: "Workflow release controls", text: "Review draft versions, publish state, retries, approvals, and verification modes.", tone: "green" },
              { href: "/admin/browser-automation/credits", label: "Credit and billing controls", text: "Manage holds, debits, top-ups, service credits, and overage posture.", tone: "amber" },
              { href: "/admin/browser-automation/workers", label: "Worker fleet controls", text: "Inspect runtime health, queue saturation, browser pool assignment, and failover posture.", tone: "red" },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="rounded-[1.5rem] border border-slate-200 bg-[#f8f8fa] p-5 transition hover:border-[#0071e3]/25 hover:bg-[#f5f9ff]">
                <StatusPill tone={card.tone as "blue" | "green" | "amber" | "red"}>{card.label}</StatusPill>
                <p className="mt-4 text-base font-semibold text-slate-950">{card.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Incident posture" kicker="What needs attention">
          <div className="grid gap-4">
            {snapshot.auditEvents.slice(0, 4).map((event) => (
              <div key={event.id} className="rounded-[1.3rem] border border-slate-200 bg-[#f8f8fa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{event.event}</p>
                  <StatusPill tone={tone(event.severity)}>{event.severity}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-slate-600">{event.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{event.target}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Run economics" kicker="Margin tracking">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[0.8fr_0.6fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Run class</span>
            <span>Runs</span>
            <span>Credits</span>
            <span>Revenue</span>
            <span>Cost</span>
            <span>Gross margin</span>
          </div>
          {economics.runsByClass.map((row) => (
            <div key={row.runClass} className="grid grid-cols-[0.8fr_0.6fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>
                <StatusPill tone={row.runClass === "light" ? "green" : row.runClass === "standard" ? "blue" : "amber"}>
                  {row.runClass}
                </StatusPill>
              </div>
              <div>{row.runs}</div>
              <div>{row.creditsBurned}</div>
              <div>${row.revenueUsd}</div>
              <div>${row.costUsd}</div>
              <div className="font-semibold text-slate-950">${row.grossMarginUsd}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Live run queue" kicker="Execution operations">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Run / Workflow</span>
            <span>Account</span>
            <span>Class</span>
            <span>Worker / Lane</span>
            <span>Status</span>
            <span>Credits</span>
            <span>Controls</span>
          </div>
          {recentRuns.map((run) => (
            <div key={run.id} className="grid grid-cols-[1.1fr_1fr_0.8fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-950">{run.id}</p>
                <p className="mt-1">{run.workflowSlug}</p>
              </div>
              <div>
                <p>{run.accountSlug}</p>
                <p className="mt-1 text-slate-500">{run.requestedBy}</p>
              </div>
              <div className="self-center">
                <StatusPill tone={run.runClass === "light" ? "green" : run.runClass === "standard" ? "blue" : "amber"}>
                  {run.runClass}
                </StatusPill>
              </div>
              <div>
                <p>{run.workerId}</p>
                <p className="mt-1 text-slate-500">{run.queueLane}</p>
              </div>
              <div className="self-center">
                <StatusPill tone={tone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
              </div>
              <div>
                <p>{run.actualCredits} actual</p>
                <p className="mt-1 text-slate-500">{run.estimatedCredits} est.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Pause</span>
                <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Retry</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
