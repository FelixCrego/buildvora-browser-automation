import Link from "next/link";
import { Panel, StatusPill } from "@/components/browser-automation-console";
import { getBrowserAutomationAccounts } from "@/lib/browserAutomationPortal";

export default async function AdminAccountsPage() {
  const accounts = await getBrowserAutomationAccounts();

  return (
    <Panel title="Accounts" kicker="Tenant controls">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
        <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.9fr_0.7fr_0.8fr_0.8fr] gap-4 bg-[#f5f5f7] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
          <span>Account</span>
          <span>Plan</span>
          <span>Status</span>
          <span>Credits</span>
          <span>Billing state</span>
          <span>Seats</span>
          <span>Concurrency</span>
          <span>Controls</span>
        </div>
        {accounts.map((account) => (
          <div key={account.id} className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.9fr_0.7fr_0.8fr_0.8fr] gap-4 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">{account.name}</p>
              <p className="mt-1 text-slate-500">{account.vertical}</p>
            </div>
            <div>
              <p>{account.planName}</p>
              <p className="mt-1 text-slate-500">{account.planType}</p>
            </div>
            <div className="self-center">
              <StatusPill tone={account.status === "active" ? "green" : account.status === "trial" ? "blue" : "amber"}>{account.status}</StatusPill>
            </div>
            <div>
              <p>{account.availableCredits.toLocaleString()}</p>
              <p className="mt-1 text-slate-500">{account.planType === "trial" ? `${account.trialCreditsRemaining}/${account.trialCreditsTotal} trial` : `soft limit ${account.softLimitCredits}`}</p>
            </div>
            <div className="self-center">
              <StatusPill tone={account.billingStatus === "active" ? "green" : account.billingStatus === "trialing" ? "blue" : "amber"}>{account.billingStatus}</StatusPill>
            </div>
            <div>{account.seats}</div>
            <div>{account.concurrencyLimit}</div>
            <div>
              <Link href={`/admin/browser-automation/accounts/${account.slug}`} className="text-[#0071e3]">
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
