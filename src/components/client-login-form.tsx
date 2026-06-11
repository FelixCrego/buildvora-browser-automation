"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@harborlegalgroup.com");
  const [workspaceCode, setWorkspaceCode] = useState("HLG-OPS-01");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      router.push("/workspace/browser-automation");
    }, 450);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-cyan-100">Client Sign-In</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Enter your automation workspace</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        This is the client-side entry to the credits-based browser automation portal.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-slate-200">
          Work email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-white/10 bg-[#07101b] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          />
        </label>
        <label className="text-sm text-slate-200">
          Workspace code
          <input
            value={workspaceCode}
            onChange={(event) => setWorkspaceCode(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-white/10 bg-[#07101b] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Opening Workspace..." : "Sign In To Portal"}
      </button>
    </form>
  );
}
