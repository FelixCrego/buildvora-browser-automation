import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getWorkerNodes } from "@/lib/browserAutomationPortal";

function tone(status: string) {
  if (status === "healthy") return "green" as const;
  if (status === "degraded") return "amber" as const;
  return "red" as const;
}

export default function AdminWorkersPage() {
  const workers = getWorkerNodes();

  return (
    <Panel title="Worker fleet" kicker="Runtime controls">
      <div className="grid gap-4 md:grid-cols-3">
        {workers.map((worker) => (
          <div key={worker.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-950">{worker.label}</p>
              <StatusPill tone={tone(worker.status)}>{worker.status}</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div><span className="text-slate-500">Region:</span> {worker.region}</div>
              <div><span className="text-slate-500">Runtime:</span> {worker.runtime}</div>
              <div><span className="text-slate-500">Browser Pool:</span> {worker.browserPool}</div>
              <div><span className="text-slate-500">Active Runs:</span> {worker.activeRuns}</div>
              <div><span className="text-slate-500">Queue Depth:</span> {worker.queueDepth}</div>
              <div><span className="text-slate-500">Heartbeat:</span> {worker.lastHeartbeatAt}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Drain</span>
              <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Reassign</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
