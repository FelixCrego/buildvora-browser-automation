import Link from "next/link";
import BrowserAutomationBillingControls from "@/components/browser-automation-billing-controls";
import { BILLING_PLANS, getBillingProviderLabel, getPublicPayPalClientId } from "@/lib/browserAutomationBilling";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { getAccountBySlug, getPrimaryWorkspaceAccount } from "@/lib/browserAutomationPortal";

export default async function BrowserAutomationBillingPage() {
  const session = await getWorkspaceSession();
  const account = session ? getAccountBySlug(session.accountSlug) ?? getPrimaryWorkspaceAccount() : getPrimaryWorkspaceAccount();

  return (
    <main className="min-h-screen bg-[#fbfbfd] px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2.4rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#0071e3]">Billing + Paywall</p>
            <h1 className="editorial mt-4 text-5xl leading-[0.94] tracking-[-0.05em] text-slate-950">
              Credits-based access controls for the automation workspace.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Clients pay with PayPal to unlock the workspace, buy credits, and keep protected execution behind a real paywall until billing is active.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                `Workspace account: ${account.name}`,
                `Current plan target: ${account.planName}`,
                `Available credits: ${account.availableCredits.toLocaleString()}`,
                "Testing coupon: TEST100OFF",
                "Protected runs and approvals stay blocked until billing is active.",
              ].map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/portal/client/login"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                Back to sign-in
              </Link>
              <Link
                href="/portal"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
              >
                Unified portal
              </Link>
            </div>
          </section>

          <section className="rounded-[2.4rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <BrowserAutomationBillingControls
              plans={BILLING_PLANS}
              billingStatus={session?.billingStatus ?? "inactive"}
              activePlan={session?.billingPlan ?? null}
              providerLabel={getBillingProviderLabel()}
              paypalClientId={getPublicPayPalClientId()}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
