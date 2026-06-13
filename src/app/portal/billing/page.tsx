import Link from "next/link";
import BrowserAutomationBillingControls from "@/components/browser-automation-billing-controls";
import {
  BILLING_FAQ,
  BILLING_PLANS,
  CREDIT_EXPLAINER,
  TRIAL_POLICY,
  getBillingProviderLabel,
  getPricingCards,
  getPublicPayPalClientId,
} from "@/lib/browserAutomationBilling";
import { getWorkspaceSession } from "@/lib/browserAutomationAuth";
import { resolveWorkspaceAccount } from "@/lib/browserAutomationPortal";

export const dynamic = "force-dynamic";

export default async function BrowserAutomationBillingPage() {
  const session = await getWorkspaceSession();
  const account = await resolveWorkspaceAccount(session);
  const pricingCards = getPricingCards();
  const checkoutPlans = BILLING_PLANS;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="tech text-[10px] uppercase tracking-[0.22em] text-sky-700">Billing</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Plans, credits, and workspace access</h1>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Start on trial, upgrade when the workflow is ready, and keep usage visible before every run.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Free trial: 3 days / 25 credits
              </span>
              <Link href="/workspace/browser-automation" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Workspace
              </Link>
              <Link href="/portal" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace summary</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Pricing that matches how customers use the product.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Start with a {TRIAL_POLICY.durationDays}-day self-serve trial, test the workflow, then move into monthly credits when it is ready for live use. Customers always see an estimated credit burn before launch.
            </p>

            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-sm font-semibold text-emerald-900">Lead with the free trial</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Every new client should be able to start with 25 credits, prove the workflow works, and upgrade only after they see value.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Workspace", account.name],
                ["Current plan", account.planName],
                ["Available credits", account.availableCredits.toLocaleString()],
                ["Trial policy", `${TRIAL_POLICY.durationDays} days / ${TRIAL_POLICY.credits} credits`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">What the customer should understand</p>
              <div className="mt-3 grid gap-2 text-sm leading-relaxed text-slate-600">
                <p>1. Start free, build the workflow, and test it quickly.</p>
                <p>2. Upgrade only when the automation is ready for real production runs.</p>
                <p>3. Credits are the only usage unit customers need to understand.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/portal/client/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Back to sign-in
              </Link>
              <Link
                href="/portal"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Portal
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <BrowserAutomationBillingControls
              plans={checkoutPlans}
              billingStatus={session?.billingStatus ?? "inactive"}
              activePlan={session?.billingPlan ?? null}
              providerLabel={getBillingProviderLabel()}
              paypalClientId={getPublicPayPalClientId()}
            />
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Launch pricing</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Straightforward credit bundles</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Customers buy outcome capacity, not tokens or browser minutes. Every workflow build, test, publish, and production run is metered in credits, with longer or more complex runs using more.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {pricingCards.map((card) => (
              <article key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-semibold text-slate-950">{card.name}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{card.price}</p>
                <p className="mt-1 text-sm text-slate-500">{card.sublabel}</p>
                <p className="mt-3 text-sm font-medium text-sky-700">{card.credits}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  {card.bullets.map((bullet) => (
                    <p key={bullet}>{bullet}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Credit guide</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Expected usage ranges</h2>
            <div className="mt-6 grid gap-3">
              {[
                `Voice build: ${CREDIT_EXPLAINER.voiceBuild} credits`,
                `Publish workflow: ${CREDIT_EXPLAINER.workflowPublish} credits`,
                `Light run: about ${CREDIT_EXPLAINER.lightRun} credits`,
                `Standard run: about ${CREDIT_EXPLAINER.standardRun} credits`,
                `Heavy run: about ${CREDIT_EXPLAINER.heavyRun} credits`,
                `Approval checkpoint: +${CREDIT_EXPLAINER.approvalCheckpoint} credits`,
                `Full retry: +${CREDIT_EXPLAINER.retry} credits`,
              ].map((line) => (
                <div key={line} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Billing FAQ</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Clear expectations before every run</h2>
            <div className="mt-6 grid gap-4">
              {BILLING_FAQ.map((item) => (
                <article key={item.question} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
