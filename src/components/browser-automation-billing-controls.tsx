"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Plan = {
  id: string;
  name: string;
  mode: "subscription" | "payment";
  monthlyLabel: string;
  creditsLabel: string;
  description: string;
  accent: string;
};

type PayPalButtonsComponent = {
  render: (selector: string | HTMLElement) => Promise<void>;
  close?: () => void;
};

type PayPalNamespace = {
  Buttons: (config: Record<string, unknown>) => PayPalButtonsComponent;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

function PayPalPlanButton({
  plan,
  couponCode,
  clientId,
  onError,
}: {
  plan: Plan;
  couponCode: string;
  clientId: string;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!clientId) {
      return undefined;
    }

    let mounted = true;
    const scriptId = "buildvora-paypal-sdk";

    function renderButtons() {
      if (!mounted || !containerRef.current || !window.paypal) {
        return;
      }

      containerRef.current.innerHTML = "";
      const isSubscription = plan.mode === "subscription";
      const buttons = window.paypal.Buttons({
        style: {
          layout: "vertical",
          shape: "pill",
          label: "paypal",
          height: 46,
        },
        createSubscription: isSubscription
          ? async () => {
              const response = await fetch("/api/browser-automation/billing/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, couponCode }),
              });
              const payload = (await response.json()) as { ok?: boolean; subscriptionId?: string; message?: string };
              if (!response.ok || !payload.ok || !payload.subscriptionId) {
                throw new Error(payload.message ?? "Unable to create PayPal subscription.");
              }
              return payload.subscriptionId;
            }
          : undefined,
        createOrder: !isSubscription
          ? async () => {
              const response = await fetch("/api/browser-automation/billing/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, couponCode }),
              });
              const payload = (await response.json()) as { ok?: boolean; orderId?: string; message?: string };
              if (!response.ok || !payload.ok || !payload.orderId) {
                throw new Error(payload.message ?? "Unable to create PayPal order.");
              }
              return payload.orderId;
            }
          : undefined,
        onApprove: async (data: Record<string, unknown>) => {
          const response = await fetch("/api/browser-automation/billing/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: plan.id,
              token: typeof data.orderID === "string" ? data.orderID : typeof data.orderId === "string" ? data.orderId : typeof data.subscriptionID === "string" ? data.subscriptionID : null,
              subscriptionId: typeof data.subscriptionID === "string" ? data.subscriptionID : null,
            }),
          });

          const payload = (await response.json()) as { ok?: boolean; nextPath?: string; message?: string };
          if (!response.ok || !payload.ok) {
            throw new Error(payload.message ?? "Unable to finalize billing activation.");
          }

          window.location.href = payload.nextPath ?? "/workspace/browser-automation?welcome=1";
        },
        onError: (error: unknown) => {
          onError(error instanceof Error ? error.message : "Unexpected PayPal checkout error.");
        },
      });

      void buttons.render(containerRef.current);
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.paypal) {
        renderButtons();
      } else {
        existingScript.addEventListener("load", renderButtons, { once: true });
      }

      return () => {
        mounted = false;
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription&components=buttons`;
    script.async = true;
    script.onload = renderButtons;
    script.onerror = () => {
      onError("Unable to load the PayPal checkout SDK.");
    };
    document.body.appendChild(script);

    return () => {
      mounted = false;
    };
  }, [clientId, couponCode, onError, plan.id, plan.mode]);

  return <div ref={containerRef} className="mt-6 min-h-[52px]" />;
}

function isCompCoupon(code: string) {
  return code.trim().toUpperCase() === "TEST100OFF";
}

export default function BrowserAutomationBillingControls({
  plans,
  billingStatus,
  activePlan,
  providerLabel,
  paypalClientId,
}: {
  plans: Plan[];
  billingStatus: string;
  activePlan: string | null;
  providerLabel: string;
  paypalClientId: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  async function claimCoupon(planId: string) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch("/api/browser-automation/billing/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          couponCode,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; nextPath?: string; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to apply the test coupon.");
      }

      window.location.href = payload.nextPath ?? "/workspace/browser-automation?welcome=1";
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unexpected coupon activation error.");
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

  const providerNotice = useMemo(() => {
    return paypalClientId
      ? "PayPal popup checkout enabled"
      : providerLabel;
  }, [paypalClientId, providerLabel]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Billing status</p>
          <p className="mt-1 text-sm text-slate-600">
            {billingStatus === "active"
              ? `Workspace unlocked on the ${activePlan ?? "active"} plan.`
              : billingStatus === "trialing"
                ? "Trial access is active. Upgrade before the 3-day trial ends to keep publishing and running in production."
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
            {providerNotice}
          </span>
        </div>
      </div>

      {billingStatus !== "active" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-900">Recommended path: start with the free trial</p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800">
            New workspaces should use the 3-day, 25-credit trial to build and test the workflow before moving to a paid production plan.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] px-5 py-5 md:grid-cols-3">
        {[
          ["Trial", "3 days and 25 credits", "Start free and prove the workflow before you pay."],
          ["Plans", "Simple monthly credit bundles", "Choose the plan that matches how often the workflow runs."],
          ["Usage", "See estimates before launch", "Approvals, retries, and heavy verification can increase usage."],
        ].map(([label, title, detail]) => (
          <div key={label} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0071e3]">{label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</p>
          </div>
        ))}
      </div>

      {billingStatus !== "active" ? (
        <div className="rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)] px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Why the trial is compelling</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                25 credits is enough to build a workflow and actually test it. This is meant to prove value, not just show a static demo.
              </p>
            </div>
            <span className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
              $25 value included
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Build + 2 tests", "5 + 10 + 10 credits"],
              ["Build + 1 standard run", "5 + 18 credits"],
              ["Upgrade only after proof", "Use the trial to validate fit first"],
            ].map(([title, note]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {billingStatus !== "active" ? (
        <div className="rounded-[1.6rem] border border-[#0f172a] bg-[radial-gradient(circle_at_top_left,#1e3a8a_0%,#0f172a_58%,#020617_100%)] px-5 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">What they should feel</p>
              <p className="mt-2 text-base font-semibold">“I can prove this works before I spend money.”</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                That is the job of the 25-credit trial. It should feel like enough to get to proof, not just enough to look around.
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
              trial first
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["5 credits", "Build", "Voice prompt to automation draft."],
              ["10 credits", "Test once", "Validate the first browser path."],
              ["10 credits", "Test again", "Confirm it is repeatable before upgrading."],
            ].map(([value, title, detail]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm font-semibold text-sky-200">{value}</p>
                <p className="mt-2 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <details className="rounded-[1.5rem] border border-slate-200 bg-[#fff8e8] px-5 py-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
          Internal testing tools
        </summary>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-[240px] flex-1 text-sm text-slate-600">
            Coupon code
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="TEST100OFF"
              className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#0071e3]/30"
            />
          </label>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Use TEST100OFF for internal launch testing
          </div>
        </div>
      </details>

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
            <div className="mt-4 rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
              {plan.id === "starter"
                ? "Best for your first production workflow."
                : plan.id === "operator"
                  ? "Best for recurring protected workflows."
                  : plan.id === "scale"
                    ? "Best for multiple workflows and higher volume."
                    : "Best for extra capacity without changing your plan."}
            </div>
            {isCompCoupon(couponCode) ? (
              <button
                type="button"
                onClick={() => void claimCoupon(plan.id)}
                disabled={loadingPlan === plan.id}
                className="mt-6 inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingPlan === plan.id ? "Unlocking..." : plan.id === "topup" ? "Apply free top-up" : "Unlock with TEST100OFF"}
              </button>
            ) : paypalClientId && plan.mode === "subscription" ? (
              <PayPalPlanButton
                plan={plan}
                couponCode={couponCode}
                clientId={paypalClientId}
                onError={setError}
              />
            ) : (
              <a
                href={`/api/browser-automation/billing/checkout/redirect?planId=${encodeURIComponent(plan.id)}&couponCode=${encodeURIComponent(couponCode)}`}
                className="mt-6 inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]"
              >
                {plan.id === "topup" ? "Buy top-up" : "Continue to PayPal"}
              </a>
            )}
          </article>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
