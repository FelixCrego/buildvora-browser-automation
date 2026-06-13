import Link from "next/link";
import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getLaunchDiagnostics } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

function tone(status: string) {
  if (status === "ready" || status === "configured") return "green" as const;
  if (status === "warning" || status === "missing") return "amber" as const;
  if (status === "error") return "red" as const;
  return "slate" as const;
}

export default async function BrowserAutomationDiagnosticsPage() {
  const diagnostics = await getLaunchDiagnostics();

  return (
    <div className="grid gap-6">
      <Panel title="Launch diagnostics" kicker="Production health">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Storage mode</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{diagnostics.storageMode}</p>
            <p className="mt-1 text-sm text-slate-600">Managed database is the intended launch path.</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Database</p>
            <div className="mt-2">
              <StatusPill tone={tone(diagnostics.database.status)}>{diagnostics.database.status}</StatusPill>
            </div>
            <p className="mt-2 text-sm text-slate-600">{diagnostics.database.message}</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Billing</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{diagnostics.billing.provider}</p>
            <p className="mt-1 text-sm text-slate-600">{diagnostics.billing.paypalEnvironment} environment</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Runtime</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{diagnostics.runtime.browserRuntime}</p>
            <p className="mt-1 text-sm text-slate-600">{diagnostics.runtime.workerMode}</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Configuration checks" kicker="Environment posture">
          <div className="grid gap-3">
            {[
              ["Managed database URL", diagnostics.database.managedUrlPresent ? "configured" : "missing"],
              ["PayPal credentials", diagnostics.billing.paypalConfigured ? "configured" : "missing"],
              ["Public PayPal client ID", diagnostics.billing.paypalClientIdPresent ? "configured" : "missing"],
              ["OpenAI API key", diagnostics.runtime.openAiConfigured ? "configured" : "missing"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
                <span className="text-sm text-slate-600">{label}</span>
                <StatusPill tone={tone(status)}>{status}</StatusPill>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="State snapshot" kicker="Live data sanity check">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Accounts", diagnostics.database.snapshot?.accounts ?? 0],
              ["Workflows", diagnostics.database.snapshot?.workflows ?? 0],
              ["Runs", diagnostics.database.snapshot?.runs ?? 0],
              ["Approvals", diagnostics.database.snapshot?.approvals ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{String(value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-[#f8fafc] px-4 py-4 text-sm text-slate-600">
            <p>Checked at {diagnostics.checkedAt}.</p>
            <p className="mt-2">
              API health endpoint:{" "}
              <Link href="/api/browser-automation/health" className="font-semibold text-[#0071e3]">
                /api/browser-automation/health
              </Link>
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
