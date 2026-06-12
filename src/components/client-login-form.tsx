"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@harborlegalgroup.com");
  const [workspaceCode, setWorkspaceCode] = useState("HLG-OPS-01");
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
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Start or reopen your automation workspace</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        New workspaces start on a 3-day, 25-credit self-serve trial. Existing paid workspaces reopen directly into the client portal.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-slate-600">
          Work email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#0071e3]"
          />
        </label>
        <label className="text-sm text-slate-600">
          Workspace code
          <input
            value={workspaceCode}
            onChange={(event) => setWorkspaceCode(event.target.value)}
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#0071e3]"
          />
        </label>
      </div>

      <div className="mt-5 rounded-[1.25rem] bg-[#f5f5f7] p-4">
        <p className="text-sm font-semibold text-slate-950">What happens next</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Self-serve trials go straight into the workspace with 25 credits. Paid workspaces reopen with their active credit balance and billing state.
        </p>
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
