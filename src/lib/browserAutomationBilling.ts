import { randomUUID } from "node:crypto";
import type { BrowserAutomationSession } from "@/lib/browserAutomationAuth";

export type BillingPlan = {
  id: "operator" | "scale" | "topup";
  name: string;
  mode: "subscription" | "payment";
  description: string;
  planIdEnv?: string;
  monthlyLabel: string;
  creditsLabel: string;
  creditsAmount: number;
  chargeAmountUsd: string;
  accent: string;
};

export type BillingCoupon = {
  code: "TEST100OFF";
  amountOffUsd: number;
  coversFullAmount?: boolean;
  operatorPlanEnv?: string;
  scalePlanEnv?: string;
};

type PayPalSubscriptionResponse = {
  id?: string;
  status?: string;
  links?: Array<{ href?: string; rel?: string; method?: string }>;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: Array<{ href?: string; rel?: string; method?: string }>;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }>;
    };
  }>;
};

type PayPalWebhookVerificationResponse = {
  verification_status?: "SUCCESS" | "FAILURE";
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "operator",
    name: "Operator",
    mode: "subscription",
    description: "For a single client team running protected browser workflows with approvals and live run support.",
    planIdEnv: "PAYPAL_PLAN_OPERATOR",
    monthlyLabel: "$1,500 / month",
    creditsLabel: "1,800 monthly credits",
    creditsAmount: 1800,
    chargeAmountUsd: "1500.00",
    accent: "Best for launch",
  },
  {
    id: "scale",
    name: "Scale",
    mode: "subscription",
    description: "For multi-workflow deployments with higher concurrency, more operators, and heavier review queues.",
    planIdEnv: "PAYPAL_PLAN_SCALE",
    monthlyLabel: "$3,900 / month",
    creditsLabel: "4,800 monthly credits",
    creditsAmount: 4800,
    chargeAmountUsd: "3900.00",
    accent: "Portfolio rollout",
  },
  {
    id: "topup",
    name: "Credit Top-Up",
    mode: "payment",
    monthlyLabel: "$750 one-time",
    creditsLabel: "900 credits",
    creditsAmount: 900,
    chargeAmountUsd: "750.00",
    description: "One-time block of credits for bursts, backfills, or overage protection without changing the base plan.",
    accent: "Burst capacity",
  },
];

export const BILLING_COUPONS: BillingCoupon[] = [
  {
    code: "TEST100OFF",
    amountOffUsd: 100,
    coversFullAmount: true,
    operatorPlanEnv: "PAYPAL_PLAN_OPERATOR_TEST100OFF",
    scalePlanEnv: "PAYPAL_PLAN_SCALE_TEST100OFF",
  },
];

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string"
    ? value.replace(/\\r/g, "").replace(/\\n/g, "").trim()
    : "";
}

export function getBillingPlan(planId: string) {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function getBillingCoupon(couponCode?: string | null) {
  if (!couponCode) {
    return null;
  }

  const normalized = couponCode.trim().toUpperCase();
  return BILLING_COUPONS.find((coupon) => coupon.code === normalized) ?? null;
}

export function isPayPalConfigured() {
  return Boolean(readEnv("PAYPAL_CLIENT_ID") && readEnv("PAYPAL_CLIENT_SECRET"));
}

export function getPayPalEnvironment() {
  return readEnv("PAYPAL_ENVIRONMENT") === "live" ? "live" : "sandbox";
}

export function getPayPalBaseUrl() {
  return getPayPalEnvironment() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export function getBillingProviderLabel() {
  return isPayPalConfigured() ? "PayPal live path ready" : "Review mode fallback active";
}

export function getPublicPayPalClientId() {
  return readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID") || readEnv("PAYPAL_CLIENT_ID");
}

export function getAppOrigin(requestUrl?: string) {
  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      return url.origin;
    } catch {
      // fall through
    }
  }

  const configuredAppUrl = readEnv("NEXT_PUBLIC_APP_URL");
  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, "");
  }

  const productionUrl = readEnv("VERCEL_PROJECT_PRODUCTION_URL");
  if (productionUrl) {
    return `https://${productionUrl}`;
  }

  const vercelUrl = readEnv("VERCEL_URL");
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

function getPayPalPlanId(plan: BillingPlan) {
  return plan.planIdEnv ? readEnv(plan.planIdEnv) : undefined;
}

function getDiscountedPayPalPlanId(plan: BillingPlan, coupon: BillingCoupon | null) {
  if (coupon?.coversFullAmount) {
    return undefined;
  }

  if (!coupon) {
    return getPayPalPlanId(plan);
  }

  if (plan.id === "operator" && coupon.operatorPlanEnv) {
    return readEnv(coupon.operatorPlanEnv) || getPayPalPlanId(plan);
  }

  if (plan.id === "scale" && coupon.scalePlanEnv) {
    return readEnv(coupon.scalePlanEnv) || getPayPalPlanId(plan);
  }

  return getPayPalPlanId(plan);
}

export function isFullyDiscountedPlan(plan: BillingPlan, coupon: BillingCoupon | null) {
  if (!coupon) {
    return false;
  }

  if (coupon.coversFullAmount) {
    return true;
  }

  return Number(getDiscountedAmount(plan, coupon)) <= 0;
}

function getDiscountedAmount(plan: BillingPlan, coupon: BillingCoupon | null) {
  if (!coupon) {
    return plan.chargeAmountUsd;
  }

  if (coupon.coversFullAmount) {
    return "0.00";
  }

  const base = Number(plan.chargeAmountUsd);
  const discounted = Math.max(base - coupon.amountOffUsd, 0);
  return discounted.toFixed(2);
}

async function getPayPalAccessToken() {
  if (!isPayPalConfigured()) {
    return null;
  }

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${readEnv("PAYPAL_CLIENT_ID")}:${readEnv("PAYPAL_CLIENT_SECRET")}`,
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("PayPal auth did not return an access token.");
  }

  return payload.access_token;
}

async function paypalRequest<T>(input: {
  path: string;
  method?: string;
  body?: unknown;
  preferRepresentation?: boolean;
}) {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    throw new Error("PayPal credentials are not configured.");
  }

  const response = await fetch(`${getPayPalBaseUrl()}${input.path}`, {
    method: input.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": randomUUID(),
      ...(input.preferRepresentation ? { Prefer: "return=representation" } : {}),
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
  });

  const payload = (await response.json()) as T & { message?: string; details?: Array<{ issue?: string; description?: string }> };
  if (!response.ok) {
    const detail = payload.details?.[0]?.description ?? payload.details?.[0]?.issue ?? payload.message;
    throw new Error(detail ? `PayPal request failed: ${detail}` : `PayPal request failed with ${response.status}.`);
  }

  return payload;
}

export async function verifyPayPalWebhook(input: {
  headers: Headers;
  event: unknown;
}) {
  const webhookId = readEnv("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    return false;
  }

  const verification = await paypalRequest<PayPalWebhookVerificationResponse>({
    path: "/v1/notifications/verify-webhook-signature",
    method: "POST",
    body: {
      auth_algo: input.headers.get("paypal-auth-algo"),
      cert_url: input.headers.get("paypal-cert-url"),
      transmission_id: input.headers.get("paypal-transmission-id"),
      transmission_sig: input.headers.get("paypal-transmission-sig"),
      transmission_time: input.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: input.event,
    },
  });

  return verification.verification_status === "SUCCESS";
}

export function resolveAccountSlugFromBillingReference(reference?: string | null) {
  if (!reference) {
    return null;
  }

  return reference.split(":")[0] ?? null;
}

function getApprovalLink(links?: Array<{ href?: string; rel?: string }>) {
  return (
    links?.find((link) => link.rel === "approve")?.href ??
    links?.find((link) => link.rel === "payer-action")?.href ??
    null
  );
}

export async function createPayPalSubscription(input: {
  planId: string;
  session: BrowserAutomationSession;
  origin?: string;
  couponCode?: string | null;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan || plan.mode !== "subscription") {
    throw new Error("Unknown subscription plan.");
  }

  const coupon = getBillingCoupon(input.couponCode);
  if (isFullyDiscountedPlan(plan, coupon)) {
    throw new Error("This coupon fully unlocks the plan internally. Use activation instead of PayPal subscription creation.");
  }

  const subscriptionPlanId = getDiscountedPayPalPlanId(plan, coupon);
  if (!isPayPalConfigured() || !subscriptionPlanId) {
    throw new Error("PayPal subscription checkout is not configured.");
  }

  const appOrigin = input.origin ?? getAppOrigin();
  const subscription = await paypalRequest<PayPalSubscriptionResponse>({
    path: "/v1/billing/subscriptions",
    method: "POST",
    preferRepresentation: true,
    body: {
      plan_id: subscriptionPlanId,
      custom_id: input.session.accountSlug,
      subscriber: {
        email_address: input.session.email,
      },
      application_context: {
        brand_name: "BuildVora Browser Automation",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appOrigin}/portal/billing/success?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
        cancel_url: `${appOrigin}/portal/billing/cancel?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
      },
    },
  });

  if (!subscription.id) {
    throw new Error("PayPal did not return a subscription id.");
  }

  return subscription.id;
}

export async function createPayPalOrder(input: {
  planId: string;
  session: BrowserAutomationSession;
  origin?: string;
  couponCode?: string | null;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan || plan.mode !== "payment") {
    throw new Error("Unknown one-time payment plan.");
  }

  const coupon = getBillingCoupon(input.couponCode);
  if (isFullyDiscountedPlan(plan, coupon)) {
    throw new Error("This coupon fully unlocks the top-up internally. Use activation instead of PayPal order creation.");
  }

  const appOrigin = input.origin ?? getAppOrigin();
  const order = await paypalRequest<PayPalOrderResponse>({
    path: "/v2/checkout/orders",
    method: "POST",
    preferRepresentation: true,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.session.accountSlug,
          custom_id: `${input.session.accountSlug}:topup`,
          description: "BuildVora Browser Automation Credit Top-Up",
          amount: {
            currency_code: "USD",
            value: getDiscountedAmount(plan, coupon),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "BuildVora Browser Automation",
            user_action: "PAY_NOW",
            return_url: `${appOrigin}/portal/billing/success?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
            cancel_url: `${appOrigin}/portal/billing/cancel?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
          },
        },
      },
    },
  });

  if (!order.id) {
    throw new Error("PayPal did not return an order id.");
  }

  return order.id;
}

export async function createCheckoutRedirect(input: {
  planId: string;
  session: BrowserAutomationSession;
  origin?: string;
  couponCode?: string | null;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan) {
    throw new Error("Unknown billing plan.");
  }

  const appOrigin = input.origin ?? getAppOrigin();
  const coupon = getBillingCoupon(input.couponCode);
  const subscriptionPlanId = getDiscountedPayPalPlanId(plan, coupon);

  if (isFullyDiscountedPlan(plan, coupon)) {
    return {
      mode: "internal" as const,
      url: `${appOrigin}/portal/billing/success?plan=${plan.id}&demo=1${coupon ? `&coupon=${coupon.code}` : ""}`,
    };
  }

  if (!isPayPalConfigured() || (plan.mode === "subscription" && !subscriptionPlanId)) {
    return {
      mode: "demo" as const,
      url: `${appOrigin}/portal/billing/success?plan=${plan.id}&demo=1${coupon ? `&coupon=${coupon.code}` : ""}`,
    };
  }

  if (plan.mode === "subscription") {
    const subscription = await paypalRequest<PayPalSubscriptionResponse>({
      path: "/v1/billing/subscriptions",
      method: "POST",
      preferRepresentation: true,
      body: {
        plan_id: subscriptionPlanId,
        custom_id: input.session.accountSlug,
        subscriber: {
          email_address: input.session.email,
        },
        application_context: {
          brand_name: "BuildVora Browser Automation",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${appOrigin}/portal/billing/success?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
          cancel_url: `${appOrigin}/portal/billing/cancel?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
        },
      },
    });

    const approvalUrl = getApprovalLink(subscription.links);
    if (!approvalUrl) {
      throw new Error("PayPal did not return an approval URL for the subscription.");
    }

    return {
      mode: "paypal" as const,
      url: approvalUrl,
    };
  }

  const order = await paypalRequest<PayPalOrderResponse>({
    path: "/v2/checkout/orders",
    method: "POST",
    preferRepresentation: true,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.session.accountSlug,
          custom_id: `${input.session.accountSlug}:topup`,
          description: "BuildVora Browser Automation Credit Top-Up",
          amount: {
            currency_code: "USD",
            value: getDiscountedAmount(plan, coupon),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "BuildVora Browser Automation",
            user_action: "PAY_NOW",
            return_url: `${appOrigin}/portal/billing/success?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
            cancel_url: `${appOrigin}/portal/billing/cancel?plan=${plan.id}${coupon ? `&coupon=${coupon.code}` : ""}`,
          },
        },
      },
    },
  });

  const approvalUrl = getApprovalLink(order.links);
  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval URL for the order.");
  }

  return {
    mode: "paypal" as const,
    url: approvalUrl,
  };
}

export async function createCustomerPortalRedirect(input: {
  session: BrowserAutomationSession;
  origin?: string;
}) {
  return {
    mode: "internal" as const,
    url: `${input.origin ?? getAppOrigin()}/portal/billing`,
  };
}

export async function resolveCheckoutActivation(input: {
  planId: string;
  token?: string | null;
  subscriptionId?: string | null;
  couponCode?: string | null;
}) {
  const plan = getBillingPlan(input.planId);
  if (!plan) {
    throw new Error("Unknown billing plan.");
  }

  const coupon = getBillingCoupon(input.couponCode);
  if (isFullyDiscountedPlan(plan, coupon)) {
    return {
      billingStatus: "active" as const,
      billingPlan: plan.id,
      billingReferenceId: `coupon:${coupon?.code ?? "internal"}:${plan.id}`,
      creditsToGrant: plan.mode === "payment" ? plan.creditsAmount : 0,
      source: "coupon" as const,
    };
  }

  if (!isPayPalConfigured()) {
    return {
      billingStatus: "active" as const,
      billingPlan: plan.id,
      billingReferenceId: null,
      creditsToGrant: plan.mode === "payment" ? plan.creditsAmount : 0,
      source: "demo",
    };
  }

  if (plan.mode === "subscription") {
    const subscriptionId = input.subscriptionId ?? input.token ?? null;
    if (!subscriptionId) {
      throw new Error("Missing PayPal subscription reference.");
    }

    const subscription = await paypalRequest<{ id?: string; status?: string }>({
      path: `/v1/billing/subscriptions/${subscriptionId}`,
    });

    if (!subscription.id || !subscription.status || !["ACTIVE", "APPROVAL_PENDING", "APPROVED"].includes(subscription.status)) {
      throw new Error("PayPal subscription has not completed approval yet.");
    }

    return {
      billingStatus: "active" as const,
      billingPlan: plan.id,
      billingReferenceId: subscription.id,
      creditsToGrant: 0,
      source: "paypal",
    };
  }

  const orderId = input.token ?? null;
  if (!orderId) {
    throw new Error("Missing PayPal order token.");
  }

  const capture = await paypalRequest<PayPalOrderResponse>({
    path: `/v2/checkout/orders/${orderId}/capture`,
    method: "POST",
    preferRepresentation: true,
    body: {},
  });

  if (!capture.id || !["COMPLETED", "APPROVED"].includes(capture.status ?? "")) {
    throw new Error("PayPal top-up payment could not be captured.");
  }

  return {
    billingStatus: "active" as const,
    billingPlan: plan.id,
    billingReferenceId: capture.id,
    creditsToGrant: plan.creditsAmount,
    source: "paypal",
  };
}
