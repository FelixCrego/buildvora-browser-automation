import { NextResponse } from "next/server";
import { activateAccountBilling, grantCreditsToAccount } from "@/lib/browserAutomationPortal";
import {
  resolveAccountSlugFromBillingReference,
  verifyPayPalWebhook,
} from "@/lib/browserAutomationBilling";

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    status?: string;
    amount?: {
      value?: string;
      currency_code?: string;
    };
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as PayPalWebhookEvent;

    if (process.env.PAYPAL_WEBHOOK_ID && process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      const verified = await verifyPayPalWebhook({
        headers: request.headers,
        event,
      });

      if (!verified) {
        return NextResponse.json({ ok: false, message: "Webhook verification failed." }, { status: 400 });
      }
    }

    const eventType = event.event_type ?? "";
    const resource = event.resource ?? {};

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const accountSlug = resolveAccountSlugFromBillingReference(resource.custom_id) ?? null;

      if (accountSlug && resource.id) {
        await activateAccountBilling({
          accountSlug,
          billingPlan: accountSlug === "northshore-clinics" ? "scale" : "operator",
          actor: "paypal-webhook",
          note: "Subscription activated from PayPal webhook.",
          externalRef: resource.id,
        });
      }
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const accountSlug =
        resolveAccountSlugFromBillingReference(resource.custom_id) ??
        resolveAccountSlugFromBillingReference(resource.supplementary_data?.related_ids?.order_id) ??
        null;

      if (accountSlug && resource.id) {
        await grantCreditsToAccount({
          accountSlug,
          amount: 900,
          note: "PayPal top-up completed.",
          actor: "paypal-webhook",
          externalRef: resource.id,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      received: true,
      eventType,
      eventId: event.id ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected PayPal webhook error." },
      { status: 500 },
    );
  }
}
