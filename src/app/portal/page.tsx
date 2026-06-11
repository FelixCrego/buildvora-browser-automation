import Link from "next/link";

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-950 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-medium text-[#0071e3]">Browser Automation Portal</p>
          <h1 className="editorial mt-4 text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.04em] text-slate-950">
            Admin backend and client execution
            <span className="block text-slate-500">in one live portal stack.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
            Credits-based browser automation workspace with admin oversight, client-side portal access, approvals, and voice-first automation intake.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Link
            href="/portal/client/login"
            className="rounded-[2.5rem] border border-slate-200 bg-[#f5f9ff] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:border-[#0071e3]/25"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Client Portal</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Client sign-in and workspace</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Login surface, workflow execution workspace, voice builder, approvals, connections, credits, and run history.
            </p>
          </Link>
          <Link
            href="/admin/browser-automation"
            className="rounded-[2.5rem] border border-slate-200 bg-[#f5f5f7] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:border-[#0071e3]/20"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Admin Backend</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Internal control plane</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Account provisioning, workflow posture, queued runs, approval pressure, connection health, and billing visibility.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
