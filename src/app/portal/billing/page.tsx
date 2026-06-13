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

export default async function BrowserAutomationBillingPage() {
  const session = await getWorkspaceSession();
  const account = await resolveWorkspaceAccount(session);
  const pricingCards = getPricingCards();
  const checkoutPlans = BILLING_PLANS;

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
              Start with a {TRIAL_POLICY.durationDays}-day self-serve trial, then move into monthly credits as soon as the automation is ready for production use.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                `Workspace account: ${account.name}`,
                `Current plan target: ${account.planName}`,
                `Available credits: ${account.availableCredits.toLocaleString()}`,
                `Trial model: ${TRIAL_POLICY.durationDays} days with ${TRIAL_POLICY.credits} credits and ${TRIAL_POLICY.maxConcurrentRuns} concurrent run.`,
                "Light runs are about 10 credits, standard runs about 18, and heavy runs about 30.",
                "Protected runs reserve credits before execution and settle the final burn at the end of the run.",
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
              plans={checkoutPlans}
              billingStatus={session?.billingStatus ?? "inactive"}
              activePlan={session?.billingPlan ?? null}
              providerLabel={getBillingProviderLabel()}
              paypalClientId={getPublicPayPalClientId()}
            />
          </section>
        </div>

        <section className="mt-6 rounded-[2.4rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#0071e3]">Launch pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Easy to understand credits with margin built in.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Customers buy outcome capacity, not tokens or browser minutes. Every workflow build, test, publish, and production run is metered in credits.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {pricingCards.map((card) => (
              <article key={card.id} className="rounded-[1.7rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="text-lg font-semibold text-slate-950">{card.name}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{card.price}</p>
                <p className="mt-1 text-sm text-slate-500">{card.sublabel}</p>
                <p className="mt-3 text-sm font-medium text-[#0071e3]">{card.credits}</p>
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
          <div className="rounded-[2.4rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#0071e3]">Credit guide</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">What customers should expect to spend.</h2>
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
                <div key={line} className="rounded-[1.2rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#0071e3]">Billing FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Clear expectations before every run.</h2>
            <div className="mt-6 grid gap-4">
              {BILLING_FAQ.map((item) => (
                <article key={item.question} className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-5">
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
