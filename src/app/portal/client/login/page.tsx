import ClientLoginForm from "@/components/client-login-form";

export default function ClientPortalLoginPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-[#0071e3]">Client Access</p>
          <h1 className="editorial mt-4 text-5xl leading-[0.94] tracking-[-0.04em] text-slate-950">Signed client access for a credits-based automation workspace.</h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            After onboarding, the client gets a dedicated login surface, a portal for running workflows, and a voice builder for scoping new automation.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Run provisioned workflows from a signed client workspace",
              "Approve sensitive steps before browser execution continues",
              "Talk through a new automation and convert it into a scoped plan",
              "Track credits, usage, run evidence, and connection health",
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
