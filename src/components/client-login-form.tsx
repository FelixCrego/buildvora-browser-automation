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
    <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">Client Sign-In</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Open your automation workspace</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Enter your work email and workspace code. New workspaces start on a 3-day, 25-credit trial. Existing workspaces reopen with their saved credits, runs, and billing state.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Sign in", "Create or reopen the workspace."],
          ["2", "Build or choose", "Use voice builder or launch an existing workflow."],
          ["3", "Run with credits", "See the estimate before execution starts."],
        ].map(([step, title, detail]) => (
          <div key={title} className="rounded-[1.2rem] border border-slate-200 bg-[#f8fafc] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0071e3]">Step {step}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-slate-600">
          Work email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#0071e3]"
          />
        </label>
        <label className="text-sm text-slate-600">
          Workspace code
          <input
            value={workspaceCode}
            onChange={(event) => setWorkspaceCode(event.target.value)}
            placeholder="TRIAL-ALPHA-01"
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#0071e3]"
          />
        </label>
      </div>

      <div className="mt-5 rounded-[1.25rem] bg-[#f5f5f7] p-4">
        <p className="text-sm font-semibold text-slate-950">What happens next</p>
        <div className="mt-2 grid gap-2 text-sm leading-relaxed text-slate-600">
          <p>Trial workspaces start with 25 credits for building and test runs.</p>
          <p>Paid workspaces open directly into production access with the current credit balance.</p>
          <p>You will see the next recommended action as soon as the workspace loads.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Opening Workspace..." : "Open Workspace"}
      </button>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
