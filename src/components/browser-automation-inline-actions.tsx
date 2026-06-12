"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function ActionButton({
  label,
  onClick,
  tone = "neutral",
  disabled,
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        tone === "danger"
          ? "rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff] disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {label}
    </button>
  );
}

function useOperate() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function operate(url: string, action: string) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            actor: "Portal Operator",
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Operation failed.");
        }

        router.refresh();
      } catch (operationError) {
        setError(operationError instanceof Error ? operationError.message : "Unexpected operation error.");
      }
    });
  }

  return { operate, error, isPending };
}

export function RunInlineActions({ runId }: { runId: string }) {
  const { operate, error, isPending } = useOperate();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ActionButton label="Pause" onClick={() => operate(`/api/browser-automation/runs/${runId}/operate`, "pause")} disabled={isPending} />
        <ActionButton label="Retry" onClick={() => operate(`/api/browser-automation/runs/${runId}/operate`, "retry")} disabled={isPending} />
        <ActionButton label="Cancel" tone="danger" onClick={() => operate(`/api/browser-automation/runs/${runId}/operate`, "cancel")} disabled={isPending} />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function ConnectionInlineActions({ connectionId }: { connectionId: string }) {
  const { operate, error, isPending } = useOperate();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ActionButton label="Re-verify" onClick={() => operate(`/api/browser-automation/connections/${connectionId}/operate`, "reverify")} disabled={isPending} />
        <ActionButton label="Rotate" onClick={() => operate(`/api/browser-automation/connections/${connectionId}/operate`, "rotate")} disabled={isPending} />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function WorkerInlineActions({
  workerId,
  status,
}: {
  workerId: string;
  status: string;
}) {
  const { operate, error, isPending } = useOperate();
  const restore = status !== "healthy";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {restore ? (
          <ActionButton label="Restore" onClick={() => operate(`/api/browser-automation/workers/${workerId}/operate`, "restore")} disabled={isPending} />
        ) : (
          <ActionButton label="Drain" onClick={() => operate(`/api/browser-automation/workers/${workerId}/operate`, "drain")} disabled={isPending} />
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
