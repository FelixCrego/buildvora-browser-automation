import Stripe from "stripe";
import type { BrowserAutomationSession } from "@/lib/browserAutomationAuth";

export type BillingPlan = {
  id: "operator" | "scale" | "topup";
  name: string;
  mode: "subscription" | "payment";
  description: string;
  priceIdEnv: string;
  monthlyLabel: string;
  creditsLabel: string;
  creditsAmount: number;
  accent: string;
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "operator",
    name: "Operator",
    mode: "subscription",
    description: "For a single client team running protected browser workflows with approvals and live run support.",
    priceIdEnv: "STRIPE_PRICE_OPERATOR",
    monthlyLabel: "$1,500 / month",
    creditsLabel: "1,800 monthly credits",
    creditsAmount: 1800,
    accent: "Best for launch",
  },
  {
    id: "scale",
    name: "Scale",
    mode: "subscription",
    description: "For multi-workflow deployments with higher concurrency, more operators, and heavier review queues.",
    priceIdEnv: "STRIPE_PRICE_SCALE",
    monthlyLabel: "$3,900 / month",
    creditsLabel: "4,800 monthly credits",
    creditsAmount: 4800,
    accent: "Portfolio rollout",
  },
  {
    id: "topup",
    name: "Credit Top-Up",
    mode: "payment",
    description: "One-time block of credits for bursts, backfills, or overage protection without changing the base plan.",
    priceIdEnv: "STRIPE_PRICE_TOPUP",
    monthlyLabel: "$750 one-time",
    creditsLabel: "900 credits",
    creditsAmount: 900,
    accent: "Burst capacity",
  },
];

let stripeClient: Stripe | null = null;

export function getBillingPlan(planId: string) {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripePriceId(plan: BillingPlan) {
  return process.env[plan.priceIdEnv];
}

export function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export async function createCheckoutRedirect(input: {
  planId: string;
  session: BrowserAutomationSession;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan) {
    throw new Error("Unknown billing plan.");
  }

  const appOrigin = getAppOrigin();
  const stripe = getStripeClient();
  const priceId = getStripePriceId(plan);

  if (!stripe || !priceId) {
    return {
      mode: "demo" as const,
      url: `${appOrigin}/portal/billing/success?plan=${plan.id}&demo=1`,
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: plan.mode,
    allow_promotion_codes: true,
    success_url: `${appOrigin}/portal/billing/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
    cancel_url: `${appOrigin}/portal/billing/cancel?plan=${plan.id}`,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: input.session.accountSlug,
    customer: input.session.stripeCustomerId ?? undefined,
    customer_email: input.session.stripeCustomerId ? undefined : input.session.email,
    metadata: {
      account_slug: input.session.accountSlug,
      workspace_code: input.session.workspaceCode,
      billing_plan: plan.id,
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe checkout did not return a redirect URL.");
  }

  return {
    mode: "stripe" as const,
    url: checkoutSession.url,
  };
}

export async function createCustomerPortalRedirect(session: BrowserAutomationSession) {
  const stripe = getStripeClient();
  if (!stripe || !session.stripeCustomerId) {
    return {
      mode: "demo" as const,
      url: `${getAppOrigin()}/portal/billing`,
    };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: session.stripeCustomerId,
    return_url: `${getAppOrigin()}/portal/billing`,
  });

  return {
    mode: "stripe" as const,
    url: portalSession.url,
  };
}

export async function resolveCheckoutActivation(input: {
  planId: string;
  sessionId?: string | null;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan) {
    throw new Error("Unknown billing plan.");
  }

  const stripe = getStripeClient();
  if (!stripe || !input.sessionId) {
    return {
      billingStatus: "active" as const,
      billingPlan: plan.id,
      stripeCustomerId: null,
      creditsToGrant: plan.mode === "payment" ? plan.creditsAmount : 0,
      source: "demo",
    };
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(input.sessionId, {
    expand: ["subscription"],
  });

  const isPaid =
    checkoutSession.payment_status === "paid" ||
    checkoutSession.status === "complete" ||
    Boolean(checkoutSession.subscription);

  if (!isPaid) {
    throw new Error("Stripe checkout has not completed yet.");
  }

  return {
    billingStatus: "active" as const,
    billingPlan: plan.id,
    stripeCustomerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : null,
    creditsToGrant: plan.mode === "payment" ? plan.creditsAmount : 0,
    source: "stripe",
  };
}

