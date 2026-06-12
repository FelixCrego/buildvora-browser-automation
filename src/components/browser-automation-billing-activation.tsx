"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BrowserAutomationBillingActivation({
  planId,
  token,
  subscriptionId,
  couponCode,
  demo,
}: {
  planId: string;
  token: string | null;
  subscriptionId: string | null;
  couponCode: string | null;
  demo: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");
  const [message, setMessage] = useState("Finalizing billing access...");

  useEffect(() => {
    let cancelled = false;

    async function activate() {
      try {
        const response = await fetch("/api/browser-automation/billing/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            token,
            subscriptionId,
            couponCode,
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; nextPath?: string; message?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Unable to activate billing.");
        }

        if (!cancelled) {
          setStatus("done");
          setMessage(demo ? "Review access unlocked. Redirecting to workspace..." : "Billing confirmed. Redirecting to workspace...");
          window.setTimeout(() => {
            router.push(payload.nextPath ?? "/workspace/browser-automation");
            router.refresh();
          }, 900);
        }
      } catch (activationError) {
        if (!cancelled) {
          setStatus("error");
          setMessage(activationError instanceof Error ? activationError.message : "Unexpected activation error.");
        }
      }
    }

    activate();

    return () => {
      cancelled = true;
    };
  }, [couponCode, demo, planId, router, subscriptionId, token]);

  return (
    <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">
        {status === "error" ? "Activation issue" : "Billing confirmation"}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
        {status === "done" ? "Access unlocked" : status === "error" ? "Billing could not be verified" : "Finalizing checkout"}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">{message}</p>
      {status !== "error" ? (
        <div className="mt-6 grid gap-3 rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-5 text-sm text-slate-600">
          <p>What happens next:</p>
          <p>The workspace session is activated, billing is recorded, and protected execution is unlocked before redirect.</p>
        </div>
      ) : null}
    </div>
  );
}
