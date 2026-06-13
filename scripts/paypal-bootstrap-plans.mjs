import { randomUUID } from "node:crypto";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = process.env.PAYPAL_ENVIRONMENT === "live" ? "live" : "sandbox";

if (!clientId || !clientSecret) {
  console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
  process.exit(1);
}

const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  return payload.access_token;
}

async function paypalRequest(accessToken, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": randomUUID(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  return payload;
}

const accessToken = await getAccessToken();

const product = await paypalRequest(accessToken, "/v1/catalogs/products", {
  name: "BuildVora Browser Automation",
  description: "Credits-based browser automation workspace subscriptions",
  type: "SERVICE",
  category: "SOFTWARE",
});

const starterPlan = await paypalRequest(accessToken, "/v1/billing/plans", {
  product_id: product.id,
  name: "BuildVora Starter",
  description: "100 monthly credits for first live browser automations",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: { value: "99", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
});

const operatorPlan = await paypalRequest(accessToken, "/v1/billing/plans", {
  product_id: product.id,
  name: "BuildVora Operator",
  description: "1,800 monthly credits for one operator team",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: { value: "1500", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
});

const scalePlan = await paypalRequest(accessToken, "/v1/billing/plans", {
  product_id: product.id,
  name: "BuildVora Scale",
  description: "4,800 monthly credits for scaled browser automation deployments",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: { value: "3900", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
});

const operatorCouponPlan = await paypalRequest(accessToken, "/v1/billing/plans", {
  product_id: product.id,
  name: "BuildVora Operator TEST100OFF",
  description: "1,800 monthly credits with a $100 testing discount",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: { value: "1400", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
});

const scaleCouponPlan = await paypalRequest(accessToken, "/v1/billing/plans", {
  product_id: product.id,
  name: "BuildVora Scale TEST100OFF",
  description: "4,800 monthly credits with a $100 testing discount",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: { value: "3800", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
});

console.log(
  JSON.stringify(
    {
      environment,
      product_id: product.id,
      PAYPAL_PLAN_STARTER: starterPlan.id,
      PAYPAL_PLAN_OPERATOR: operatorPlan.id,
      PAYPAL_PLAN_SCALE: scalePlan.id,
      PAYPAL_PLAN_OPERATOR_TEST100OFF: operatorCouponPlan.id,
      PAYPAL_PLAN_SCALE_TEST100OFF: scaleCouponPlan.id,
    },
    null,
    2,
  ),
);
