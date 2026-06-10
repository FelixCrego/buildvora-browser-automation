import Image from "next/image";
import { notFound } from "next/navigation";
import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getRunById } from "@/lib/browserAutomationPortal";

function statusTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "running") return "blue" as const;
  if (status === "awaiting_approval") return "amber" as const;
  if (status === "failed") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Panel title={run.summary} kicker="Run detail">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill tone={statusTone(run.status)}>{run.status.replace(/_/g, " ")}</StatusPill>
          <StatusPill tone="blue">{run.estimatedCredits} estimated credits</StatusPill>
          <StatusPill tone="slate">{run.actualCredits} actual credits</StatusPill>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
          <div className="grid gap-4">
            {run.evidence.map((src) => (
              <div key={src} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/4">
                <div className="relative h-[260px]">
                  <Image src={src} alt="Run evidence" fill className="object-cover object-center" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Execution timeline</p>
              <div className="mt-4 grid gap-3">
                {run.timeline.map((step) => (
                  <div key={step.label} className="rounded-[1.1rem] border border-white/10 bg-[#08111c] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <StatusPill tone={statusTone(step.status === "blocked" ? "awaiting_approval" : step.status === "done" ? "completed" : step.status === "active" ? "running" : "queued")}>
                        {step.status}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Billing record</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <div className="rounded-[1rem] border border-white/10 bg-[#08111c] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Estimated</p>
                  <p className="mt-2 text-xl font-semibold text-white">{run.estimatedCredits} credits</p>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-[#08111c] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Actual</p>
                  <p className="mt-2 text-xl font-semibold text-white">{run.actualCredits} credits</p>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-[#08111c] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Vendor cost</p>
                  <p className="mt-2 text-xl font-semibold text-white">${run.vendorCostUsd.toFixed(2)}</p>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-[#08111c] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Approvals triggered</p>
                  <p className="mt-2 text-xl font-semibold text-white">{run.approvalsTriggered}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
