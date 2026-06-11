import ClientLoginForm from "@/components/client-login-form";

export default function ClientPortalLoginPage() {
  return (
    <main className="min-h-screen bg-[#07101b] px-6 py-16 text-slate-100 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,30,0.98),rgba(8,12,20,0.94))] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#d7b26f]">Client Access</p>
          <h1 className="editorial mt-4 text-5xl leading-[0.94] text-white">Signed client access for a credits-based automation workspace.</h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            After onboarding, the client gets a dedicated login surface, a portal for running workflows, and a voice builder for scoping new automation.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Run provisioned workflows from a signed client workspace",
              "Approve sensitive steps before browser execution continues",
              "Talk through a new automation and convert it into a scoped plan",
              "Track credits, usage, run evidence, and connection health",
            ].map((item) => (
              <div key={item} className="rounded-[1rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-300">
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
