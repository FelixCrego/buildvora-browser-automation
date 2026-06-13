"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [workspaceCode, setWorkspaceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = workspaceCode.trim().toUpperCase();

    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid work email.");
      return;
    }

    if (normalizedCode.length < 6) {
      setError("Enter a valid workspace code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/browser-automation/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          workspaceCode: normalizedCode,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; nextPath?: string; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to sign in.");
      }

      router.push(payload.nextPath ?? "/portal/billing");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unexpected sign-in error.");
      setLoading(false);
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="tech text-[10px] uppercase tracking-[0.22em] text-sky-700">Client Sign-In</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Open your workspace</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Secure session
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Enter your work email and workspace code. New workspaces start on a 3-day, 25-credit trial. Existing workspaces reopen with their saved credits, runs, and billing state.
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p className="text-sm font-semibold text-emerald-900">Start free before you commit</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800">
          The trial is designed to get a real workflow built and tested quickly, without paying first.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Sign in", "Create or reopen the workspace."],
          ["2", "Build or choose", "Use voice builder or launch an existing workflow."],
          ["3", "Run with credits", "See the estimate before execution starts."],
        ].map(([step, title, detail]) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700">Step {step}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-[#0f172a] p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">Why the trial feels real</p>
            <p className="mt-2 text-base font-semibold">It is designed to get one workflow to proof, not to stall in setup.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
            25 credits total
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["5 credits", "Build the workflow", "Voice prompt to runnable scope."],
            ["10 credits", "First test run", "Validate selectors and approvals."],
            ["10 credits", "Second test run", "Confirm the handoff before paying."],
          ].map(([value, title, detail]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-semibold text-sky-200">{value}</p>
              <p className="mt-2 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-slate-600">
          Work email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-600"
          />
        </label>
        <label className="text-sm text-slate-600">
          Workspace code
          <input
            value={workspaceCode}
            onChange={(event) => setWorkspaceCode(event.target.value)}
            placeholder="TRIAL-ALPHA-01"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-sky-600"
          />
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">What happens next</p>
        <div className="mt-2 grid gap-2 text-sm leading-relaxed text-slate-600">
          <p>Trial workspaces start with 25 credits for building and test runs.</p>
          <p>Paid workspaces open directly into production access with the current credit balance.</p>
          <p>You will see the next recommended action as soon as the workspace loads.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)] p-4">
        <p className="text-sm font-semibold text-slate-950">25-credit trial examples</p>
        <div className="mt-2 grid gap-2 text-sm leading-relaxed text-slate-600">
          <p>Build one workflow from voice: 5 credits.</p>
          <p>Run two light tests after that: 10 + 10 credits.</p>
          <p>Or build once and use one standard run: 5 + 18 credits.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex rounded-xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111c33] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Opening Workspace..." : "Open Workspace"}
      </button>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
