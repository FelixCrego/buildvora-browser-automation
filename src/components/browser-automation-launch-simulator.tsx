"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

export default function BrowserAutomationLaunchSimulator({
  workflowSlug,
}: {
  workflowSlug: string;
}) {
  const [targetCount, setTargetCount] = useState("8");
  const [verificationMode, setVerificationMode] = useState<"standard" | "heavy">("standard");
  const [result, setResult] = useState<null | {
    runClass: "light" | "standard" | "heavy";
    estimatedCredits: number;
    estimatedVendorCostUsd: number;
    holdCredits: number;
    breakdown: Array<{ label: string; credits: number }>;
    explanation: string;
    projectedStatus: string;
  }>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const requestLaunch = (execute: boolean) => {
    setError(null);
    if (!execute) {
      setRunId(null);
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/browser-automation/runs/launch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflowSlug,
            targetCount: Number(targetCount),
            verificationMode,
            execute,
            requestedBy: "Workspace Operator",
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          message?: string;
          launch?: {
            runClass: "light" | "standard" | "heavy";
            estimatedCredits: number;
            estimatedVendorCostUsd: number;
            holdCredits: number;
            breakdown: Array<{ label: string; credits: number }>;
            explanation: string;
            projectedStatus: string;
          };
          run?: {
            id: string;
          };
        };

        if (!response.ok || !payload.launch) {
          throw new Error(payload.message ?? "Launch estimate could not be generated.");
        }

        setResult(payload.launch);
        setRunId(payload.run?.id ?? null);
      } catch (launchError) {
        setError(launchError instanceof Error ? launchError.message : "Unexpected launch estimation error.");
      }
    });
  };

  return (
    <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-300/8 p-5">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-cyan-100">Launch Preview</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-200">
          Target items
          <input
            type="number"
            min={1}
            max={50}
            value={targetCount}
            onChange={(event) => setTargetCount(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-white/10 bg-[#07101b] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          />
        </label>
        <label className="text-sm text-slate-200">
          Verification mode
          <select
            value={verificationMode}
            onChange={(event) => setVerificationMode(event.target.value as "standard" | "heavy")}
            className="mt-2 w-full rounded-[1rem] border border-white/10 bg-[#07101b] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          >
            <option value="standard">Standard verification</option>
            <option value="heavy">Heavy verification</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => requestLaunch(false)}
          className="inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Estimating..." : "Estimate Credit Hold"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => requestLaunch(true)}
          className="inline-flex rounded-full border border-cyan-200/30 bg-white/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Launching..." : "Launch Workflow"}
        </button>
        <p className="self-center text-sm text-slate-300">Customers see estimated credits before launch. Runtime, approvals, and retries are already priced into the run class.</p>
      </div>
      {result ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.2rem] border border-white/10 bg-[#07101b] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Estimated Credits</p>
            <p className="mt-2 text-2xl font-semibold text-white">{result.estimatedCredits}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-cyan-100">{result.runClass} run</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#07101b] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Temporary Hold</p>
            <p className="mt-2 text-2xl font-semibold text-white">{result.holdCredits}</p>
            <p className="mt-2 text-sm text-slate-400">{result.explanation}</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#07101b] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Projected Status</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">{result.projectedStatus.replace(/_/g, " ")}</p>
            <p className="mt-2 text-sm text-slate-400">${result.estimatedVendorCostUsd.toFixed(2)} est. vendor cost</p>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-[#07101b] p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Estimate breakdown</p>
          <div className="mt-3 grid gap-2">
            {result.breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2">
                <span>{item.label}</span>
                <span>{item.credits} credits</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {runId ? (
        <div className="mt-4 rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
          <p className="font-semibold">Run launched</p>
          <p className="mt-1">
            <Link href={`/workspace/browser-automation/runs/${runId}`} className="underline underline-offset-4">
              Open run {runId}
            </Link>
          </p>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
