import Link from "next/link";

export default async function BrowserAutomationBillingCancelPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto max-w-3xl rounded-[2.4rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Billing cancelled</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Checkout was not completed.</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          The workspace remains behind the paywall until billing is activated. You can restart checkout or return to the unified portal.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/portal/billing"
            className="rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]"
          >
            Return to billing
          </Link>
          <Link
            href="/portal"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff]"
          >
            Unified portal
          </Link>
        </div>
      </div>
    </main>
  );
}

