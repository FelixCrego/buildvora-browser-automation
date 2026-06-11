import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getCreditLedgerEntries } from "@/lib/browserAutomationPortal";

export default function AdminCreditsPage() {
  const entries = getCreditLedgerEntries();

  return (
    <Panel title="Credits and billing ledger" kicker="Financial controls">
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
    </Panel>
  );
}
