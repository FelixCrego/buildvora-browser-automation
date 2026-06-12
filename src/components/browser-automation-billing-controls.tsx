"use client";

import { useState } from "react";

type Plan = {
  id: string;
  name: string;
  monthlyLabel: string;
  creditsLabel: string;
  description: string;
  accent: string;
};

export default function BrowserAutomationBillingControls({
  plans,
  billingStatus,
  activePlan,
  stripeEnabled,
}: {
  plans: Plan[];
  billingStatus: string;
  activePlan: string | null;
  stripeEnabled: boolean;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch("/api/browser-automation/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string };
      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(payload.message ?? "Unable to start billing checkout.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unexpected checkout error.");
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setLoadingPlan("portal");
    setError(null);

    try {
      const response = await fetch("/api/browser-automation/billing/portal", {
        method: "POST",
      });

      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string };
      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(payload.message ?? "Unable to open billing portal.");
      }

      window.location.href = payload.url;
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Unexpected billing portal error.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Billing status</p>
          <p className="mt-1 text-sm text-slate-600">
            {billingStatus === "active"
              ? `Workspace unlocked on the ${activePlan ?? "active"} plan.`
              : "Workspace access is blocked until a paid plan or review unlock is active."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {billingStatus === "active" ? (
            <button
              type="button"
              onClick={openPortal}
              disabled={loadingPlan === "portal"}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#0071e3]/20 hover:bg-[#f5f9ff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingPlan === "portal" ? "Opening..." : "Manage billing"}
            </button>
          ) : null}
          <span className="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {stripeEnabled ? "Stripe live path ready" : "Review mode fallback active"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950">{plan.name}</p>
                <p className="mt-1 text-sm text-slate-500">{plan.accent}</p>
              </div>
              {activePlan === plan.id ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-700">
                  Active
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{plan.monthlyLabel}</p>
            <p className="mt-2 text-sm font-medium text-[#0071e3]">{plan.creditsLabel}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{plan.description}</p>
            <button
              type="button"
              onClick={() => startCheckout(plan.id)}
              disabled={loadingPlan === plan.id}
              className="mt-6 inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingPlan === plan.id ? "Redirecting..." : plan.id === "topup" ? "Buy top-up" : "Start plan"}
            </button>
          </article>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

