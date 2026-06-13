import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getBrowserAutomationWorkflows, getWorkflowVersions } from "@/lib/browserAutomationPortal";

export default async function AdminWorkflowsPage() {
  const workflows = await getBrowserAutomationWorkflows();
  const versions = await getWorkflowVersions();

  return (
    <div className="grid gap-6">
      <Panel title="Workflow registry" kicker="Version and publish controls">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Workflow</span>
            <span>Account</span>
            <span>State</span>
            <span>Risk</span>
            <span>Version</span>
            <span>Retry Policy</span>
            <span>Controls</span>
          </div>
          {workflows.map((workflow) => (
            <div key={workflow.id} className="grid grid-cols-[1.2fr_1fr_0.7fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-950">{workflow.name}</p>
                <p className="mt-1 text-slate-500">{workflow.summary}</p>
              </div>
              <div>{workflow.accountSlug}</div>
              <div className="self-center">
                <StatusPill tone={workflow.state === "published" ? "green" : workflow.state === "draft" ? "amber" : "slate"}>{workflow.state}</StatusPill>
              </div>
              <div className="self-center">
                <StatusPill tone={workflow.riskLevel === "high" ? "red" : workflow.riskLevel === "medium" ? "amber" : "green"}>{workflow.riskLevel}</StatusPill>
              </div>
              <div>{workflow.latestVersion}</div>
              <div>{workflow.retryPolicy}</div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Publish</span>
                <span className="rounded-full border border-slate-200 bg-[#f5f5f7] px-3 py-1 text-xs text-slate-700">Pause</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Version history" kicker="Release review">
        <div className="grid gap-4 md:grid-cols-2">
          {versions.map((version) => (
            <div key={version.id} className="rounded-[1.4rem] border border-slate-200 bg-[#f8f8fa] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">{version.workflowSlug}</p>
                <StatusPill tone={version.state === "published" ? "green" : version.state === "draft" ? "amber" : "slate"}>{version.state}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-slate-600">{version.version} · {version.createdBy}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{version.releaseNote}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{version.approvalChecksum}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
