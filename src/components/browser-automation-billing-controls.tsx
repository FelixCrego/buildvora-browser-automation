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
  providerLabel,
}: {
  plans: Plan[];
  billingStatus: string;
  activePlan: string | null;
  providerLabel: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("TEST100OFF");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    setLoadingPlan(planId);
    setError(null);
    setCheckoutUrl(null);

    try {
      const response = await fetch("/api/browser-automation/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, couponCode }),
      });

      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string };
      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(payload.message ?? "Unable to start billing checkout.");
      }

      setCheckoutUrl(payload.url);
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
            {providerLabel}
          </span>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-[#fff8e8] px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[240px] flex-1 text-sm text-slate-600">
            Test coupon
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="TEST100OFF"
              className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]/30"
            />
          </label>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            $100 off testing code
          </div>
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

      {checkoutUrl ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <p className="font-semibold">Redirect prepared</p>
          <p className="mt-1 break-all">Destination: {checkoutUrl}</p>
          <a
            href={checkoutUrl}
            className="mt-3 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue to PayPal
          </a>
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
