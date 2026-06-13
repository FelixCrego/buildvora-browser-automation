import ClientLoginForm from "@/components/client-login-form";

export const dynamic = "force-dynamic";

export default function ClientPortalLoginPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-[#0071e3]">Client Access</p>
          <h1 className="editorial mt-4 text-5xl leading-[0.94] tracking-[-0.04em] text-slate-950">Browser automation your client can actually sign in and run.</h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            This is the customer-facing workspace. Clients can sign in, start a short trial, build a workflow from voice, approve protected actions, and run automation with visible credit estimates.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Start a 3-day trial with 25 credits",
              "Run provisioned workflows from one workspace",
              "Approve sensitive steps before execution continues",
              "Track credits, run evidence, and connection health",
            ].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-slate-200 bg-[#f5f5f7] px-4 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
        <ClientLoginForm />
      </div>
    </main>
  );
}
