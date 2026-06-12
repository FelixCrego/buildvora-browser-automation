import { Panel, StatCard, StatusPill } from "@/components/browser-automation-console";
import { getAdminEconomicsSnapshot, getBillingAuditEvents, getCreditLedgerEntries } from "@/lib/browserAutomationPortal";

export default function AdminCreditsPage() {
  const entries = getCreditLedgerEntries();
  const billingEvents = getBillingAuditEvents();
  const economics = getAdminEconomicsSnapshot();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Credits Sold" value={economics.totals.creditsSold.toLocaleString()} detail="Total credits granted through billing events." />
        <StatCard label="Credits Burned" value={economics.totals.creditsBurned.toLocaleString()} detail="Credits settled against completed runs." />
        <StatCard label="Credits Granted" value={economics.totals.creditsGranted.toLocaleString()} detail="Trial grants, monthly credits, and manual service credits." />
        <StatCard label="Avg Cost / Run" value={`$${economics.totals.averageCostPerRunUsd}`} detail="Estimated vendor cost from browser and model activity." />
        <StatCard label="Gross Margin" value={`$${economics.totals.grossMarginUsd.toLocaleString()}`} detail="Revenue equivalent minus vendor cost across completed runs." />
      </div>

      <Panel title="Credits and billing ledger" kicker="Financial controls">
        <div className="grid gap-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[0.9fr_0.8fr_0.8fr_0.8fr_1.4fr_0.7fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Account</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Balance</span>
            <span>Note</span>
            <span>Source</span>
          </div>
          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[0.9fr_0.8fr_0.8fr_0.8fr_1.4fr_0.7fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>{entry.accountSlug}</div>
              <div>
                <StatusPill tone={entry.type === "refund" || entry.type === "grant" ? "green" : entry.type === "hold" ? "amber" : "blue"}>{entry.type}</StatusPill>
              </div>
              <div>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</div>
              <div>{entry.balanceAfter}</div>
              <div>{entry.note}</div>
              <div>{entry.source}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="grid grid-cols-[0.9fr_0.8fr_0.9fr_1.8fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Account</span>
            <span>Event</span>
            <span>Actor</span>
            <span>Detail</span>
          </div>
          {billingEvents.slice(0, 12).map((event) => (
            <div key={event.id} className="grid grid-cols-[0.9fr_0.8fr_0.9fr_1.8fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <div>{event.accountSlug ?? "system"}</div>
              <div>
                <StatusPill tone={event.event === "billing.activated" ? "green" : "blue"}>{event.event}</StatusPill>
              </div>
              <div>{event.actor}</div>
              <div>{event.detail}</div>
            </div>
          ))}
        </div>
        </div>
      </Panel>
    </div>
  );
}
