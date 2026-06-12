"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BrowserAutomationApprovalActions({
  approvalId,
  fallbackApprover,
}: {
  approvalId: string;
  fallbackApprover: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resolveApproval(approved: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/browser-automation/approvals/${approvalId}/resolve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approved,
            approver: fallbackApprover,
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Approval resolution failed.");
        }

        router.refresh();
      } catch (approvalError) {
        setError(
          approvalError instanceof Error ? approvalError.message : "Unexpected approval resolution error.",
        );
      }
    });
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => resolveApproval(true)}
          className="inline-flex rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Applying..." : "Approve and Continue"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => resolveApproval(false)}
          className="inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/18 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Reject Step
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
