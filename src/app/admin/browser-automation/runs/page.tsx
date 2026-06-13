import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getBrowserAutomationRuns } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function tone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "awaiting_approval" || status === "paused" || status === "queued") return "amber" as const;
  if (status === "failed" || status === "cancelled") return "red" as const;
  return "slate" as const;
}

export default async function AdminRunsPage() {
  const runs = await getBrowserAutomationRuns();

  return (
    <Panel title="Run operations" kicker="Queue and execution controls">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
        <div className="grid grid-cols-[0.9fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
          <span>Run</span>
          <span>Workflow / Account</span>
          <span>Worker</span>
          <span>Status</span>
          <span>Lane</span>
          <span>Credits</span>
          <span>Controls</span>
        </div>
        {runs.map((run) => (
          <div key={run.id} className="grid grid-cols-[0.9fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">{run.id}</p>
              <p className="mt-1 text-slate-500">{run.requestedBy}</p>
            </div>
            <div>
              <p>{run.workflowSlug}</p>
              <p className="mt-1 text-slate-500">{run.accountSlug}</p>
            </div>
            <div>{run.workerId}</div>
            <div className="self-center">
              <StatusPill tone={tone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
            </div>
            <div>{run.queueLane}</div>
            <div>
              <p>{run.actualCredits} actual</p>
              <p className="mt-1 text-slate-500">{run.estimatedCredits} est</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Cancel</span>
              <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Replay</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
