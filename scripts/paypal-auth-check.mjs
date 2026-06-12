const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = process.env.PAYPAL_ENVIRONMENT === "live" ? "live" : "sandbox";

if (!clientId || !clientSecret) {
  console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
  process.exit(1);
}

const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
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

if (!response.ok) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      environment,
      scope: payload.scope,
      token_type: payload.token_type,
      expires_in: payload.expires_in,
    },
    null,
    2,
  ),
);

