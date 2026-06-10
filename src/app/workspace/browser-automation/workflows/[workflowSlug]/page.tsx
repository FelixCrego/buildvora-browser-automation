import { notFound } from "next/navigation";
import BrowserAutomationLaunchSimulator from "@/components/browser-automation-launch-simulator";
import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getWorkflowBySlug } from "@/lib/browserAutomationPortal";

function riskTone(riskLevel: string) {
  if (riskLevel === "high") return "amber" as const;
  if (riskLevel === "medium") return "blue" as const;
  return "green" as const;
}

export default async function BrowserAutomationWorkflowPage({
  params,
}: {
  params: Promise<{ workflowSlug: string }>;
}) {
  const { workflowSlug } = await params;
  const workflow = getWorkflowBySlug(workflowSlug);

  if (!workflow) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Panel title={workflow.name} kicker="Workflow detail">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone={riskTone(workflow.riskLevel)}>{workflow.riskLevel} risk</StatusPill>
              <StatusPill tone="slate">{workflow.latestVersion}</StatusPill>
              <StatusPill tone="blue">{workflow.estimatedCredits}</StatusPill>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">{workflow.summary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 p-5">
                <p className="text-sm font-semibold text-white">Systems involved</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{workflow.systems.join(", ")}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 p-5">
                <p className="text-sm font-semibold text-white">Approval policy</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{workflow.approvalPolicy}</p>
              </div>
            </div>
            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#08111c] p-5">
              <p className="text-sm font-semibold text-white">Runtime notes</p>
              <div className="mt-3 grid gap-3">
                {workflow.runtimeNotes.map((note) => (
                  <div key={note} className="rounded-[1rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-300">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/4 p-5">
              <p className="text-sm font-semibold text-white">Required connections</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workflow.requiredConnections.map((connection) => (
                  <span
                    key={connection}
                    className="inline-flex rounded-full border border-white/10 bg-[#08111c] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200"
                  >
                    {connection}
                  </span>
                ))}
              </div>
            </div>
            <BrowserAutomationLaunchSimulator workflowSlug={workflow.slug} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
