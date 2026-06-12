import { randomUUID } from "node:crypto";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = process.env.PAYPAL_ENVIRONMENT === "live" ? "live" : "sandbox";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/$/, "");

if (!clientId || !clientSecret) {
  console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
  process.exit(1);
}

if (!appUrl) {
  console.error("Missing NEXT_PUBLIC_APP_URL or APP_URL.");
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

const accessToken = await getAccessToken();
const response = await fetch(`${baseUrl}/v1/notifications/webhooks`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "PayPal-Request-Id": randomUUID(),
  },
  body: JSON.stringify({
    url: `${appUrl}/api/browser-automation/billing/webhook`,
    event_types: [
      { name: "BILLING.SUBSCRIPTION.ACTIVATED" },
      { name: "PAYMENT.CAPTURE.COMPLETED" },
    ],
  }),
});

const payload = await response.json();
if (!response.ok) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      environment,
      webhook_url: `${appUrl}/api/browser-automation/billing/webhook`,
      PAYPAL_WEBHOOK_ID: payload.id,
    },
    null,
    2,
  ),
);

