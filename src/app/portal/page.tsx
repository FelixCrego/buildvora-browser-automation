import Link from "next/link";

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-[#07101b] px-6 py-16 text-slate-100 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="tech text-[10px] uppercase tracking-[0.3em] text-cyan-200">Browser Automation Portal</p>
          <h1 className="editorial mt-4 text-[clamp(3rem,7vw,6rem)] leading-[0.92] text-white">
            Admin backend and client execution
            <span className="block text-white/64">in one live portal stack.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            Credits-based browser automation workspace with admin oversight, client-side portal access, approvals, and voice-first automation intake.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Link
            href="/portal/client/login"
            className="rounded-[2rem] border border-cyan-300/25 bg-cyan-300/8 p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)] transition hover:border-cyan-200/40 hover:bg-cyan-300/12"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Client Portal</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Client sign-in and workspace</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Login surface, workflow execution workspace, voice builder, approvals, connections, credits, and run history.
            </p>
          </Link>
          <Link
            href="/admin/browser-automation"
            className="rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)] transition hover:border-white/22 hover:bg-white/10"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3debb]">Admin Backend</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Internal control plane</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Account provisioning, workflow posture, queued runs, approval pressure, connection health, and billing visibility.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
