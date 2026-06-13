import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import { getAccountEconomicsRows, getAdminEconomicsSnapshot } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

export default async function BrowserAutomationEconomicsPage() {
  const economics = await getAdminEconomicsSnapshot();
  const accounts = await getAccountEconomicsRows();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="MRR" value={`$${economics.totals.mrrUsd.toLocaleString()}`} detail="Current recurring plan revenue." />
        <StatCard label="Avg Credits / Run" value={String(economics.totals.averageCreditsPerRun)} detail="Settled usage per completed run." />
        <StatCard label="Avg Revenue / Run" value={`$${economics.totals.averageRevenuePerRunUsd}`} detail="Estimated run revenue using plan credit value." />
        <StatCard label="Avg Cost / Run" value={`$${economics.totals.averageCostPerRunUsd}`} detail="Estimated browser and model cost per completed run." />
        <StatCard label="Gross Margin" value={`$${economics.totals.grossMarginUsd.toLocaleString()}`} detail="Revenue less vendor cost across completed runs." />
      </div>

      <Panel title="Run-class margin profile" kicker="Pricing guardrails">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[0.8fr_0.6fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Run class</span>
            <span>Runs</span>
            <span>Credits</span>
            <span>Revenue</span>
            <span>Cost</span>
            <span>Margin</span>
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

      <Panel title="Account unit economics" kicker="Margin by tenant">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[0.9fr_0.7fr_0.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Account</span>
            <span>Plan</span>
            <span>Runs</span>
            <span>Credits</span>
            <span>Revenue</span>
            <span>Cost</span>
            <span>Margin</span>
            <span>Retry rate</span>
            <span>Approval rate</span>
          </div>
          {accounts.map((row) => (
            <div key={row.accountSlug} className="grid grid-cols-[0.9fr_0.7fr_0.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-950">{row.accountName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.accountSlug}</p>
              </div>
              <div>{row.planName}</div>
              <div>{row.runs}</div>
              <div>{row.creditsBurned}</div>
              <div>${row.revenueUsd}</div>
              <div>${row.costUsd}</div>
              <div>
                <p className="font-semibold text-slate-950">${row.grossMarginUsd}</p>
                <p className="mt-1 text-xs text-slate-500">{row.grossMarginPct}%</p>
              </div>
              <div>{row.retryRatePct}%</div>
              <div>{row.approvalRatePct}%</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
