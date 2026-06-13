import ClientLoginForm from "@/components/client-login-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ClientPortalLoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-4 md:px-8">
          <div>
            <p className="tech text-[10px] uppercase tracking-[0.22em] text-sky-700">Client Access</p>
            <p className="mt-1 text-sm text-slate-500">Secure entry for trial and production workspaces</p>
          </div>
          <Link href="/portal" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Back to portal
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1180px] gap-6 px-6 py-8 md:px-8 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace access</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Sign in to your automation workspace</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Clients use one workspace to build, test, approve, and run browser automations with visible credit usage.
          </p>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <p className="text-sm font-semibold text-emerald-900">Free trial included</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-800">
              New workspaces start with 25 credits for 3 days. Build a workflow, test it, and upgrade only when you are ready for production.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              ["Trial", "3 days and 25 credits to validate the workflow."],
              ["Approvals", "Protected actions pause until the right person releases them."],
              ["Runs", "Every launch shows an estimate before credits are used."],
              ["Evidence", "Review run history, outputs, and connection health in one place."],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">How far 25 credits goes</p>
            <div className="mt-3 grid gap-3">
              {[
                ["1 workflow build + 2 light tests", "5 + 10 + 10 credits"],
                ["1 workflow build + 1 standard run", "5 + 18 credits"],
                ["$25 in product value", "based on $1/credit top-up pricing"],
              ].map(([title, note]) => (
                <div key={title} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-[1.6rem] border border-[#0f172a] bg-[radial-gradient(circle_at_top_left,#1e3a8a_0%,#0f172a_58%,#020617_100%)] p-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">Trial outcome</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Enough room to prove one real workflow</h2>
              </div>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
                25 credits live
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Build once", "Voice input to workflow draft", "5 credits"],
                ["Test twice", "Two light runs with visible credit estimates", "20 credits"],
                ["Upgrade after proof", "Move to paid only after the workflow works", "$25 trial value"],
              ].map(([title, note, value]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{note}</p>
                  <p className="mt-3 text-sm font-semibold text-sky-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <ClientLoginForm />
        </section>
      </div>
    </main>
  );
}
