import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/server/stripe/client";
import {
  claimStripeWebhookEvent,
  releaseStripeWebhookEvent,
} from "@/lib/server/stripe/webhook-idempotency";
import {
  downgradeEmployerToDiscovery,
  syncEmployerSubscription,
  syncEmployerSubscriptionFromStripe,
  type SyncMetaOverrides,
} from "@/lib/server/stripe/sync-subscription";
import {
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "@/lib/server/stripe/invoice-handlers";
import { handleChargeDispute } from "@/lib/server/stripe/dispute-handlers";
import { getInvoiceSubscriptionRef } from "@/lib/server/stripe/invoice-utils";
import { safeError, safeLog } from "@/utils/logger";

/**
 * Live Subscription with expanded price — required for price→plan mapping.
 */
async function retrieveLiveSubscription(
  stripe: Stripe,
  subscriptionRef: string | Stripe.Subscription | null | undefined
): Promise<Stripe.Subscription | null> {
  if (!subscriptionRef) return null;
  const id =
    typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
  return stripe.subscriptions.retrieve(id, {
    expand: ["items.data.price"],
  });
}

function sessionMetaOverrides(
  session: Stripe.Checkout.Session
): SyncMetaOverrides {
  return {
    employer_id: session.metadata?.employer_id || session.client_reference_id || undefined,
    plan_id: session.metadata?.plan_id || undefined,
    plan_slug: session.metadata?.plan_slug || undefined,
  };
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")
    ? "live"
    : "test";
  safeLog(`[Stripe] Processing ${event.type} id=${event.id} mode=${mode}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const subscription = await retrieveLiveSubscription(
        stripe,
        session.subscription
      );
      if (subscription) {
        const result = await syncEmployerSubscriptionFromStripe(
          subscription,
          event.id,
          event.created,
          sessionMetaOverrides(session)
        );
        if (!result.success) {
          throw new Error(result.error ?? "Subscription sync failed");
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const payload = event.data.object as Stripe.Subscription;
      const subscription = await retrieveLiveSubscription(stripe, payload.id);
      if (!subscription) break;
      const result = await syncEmployerSubscriptionFromStripe(
        subscription,
        event.id,
        event.created
      );
      if (!result.success) {
        throw new Error(result.error ?? "Subscription sync failed");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const payload = event.data.object as Stripe.Subscription;
      const live = await retrieveLiveSubscription(stripe, payload.id).catch(
        () => null
      );
      if (live && live.status !== "canceled") {
        const result = await syncEmployerSubscriptionFromStripe(
          live,
          event.id,
          event.created
        );
        if (!result.success) {
          throw new Error(result.error ?? "Subscription sync failed");
        }
        break;
      }

      const sub = live ?? payload;
      let employerId = sub.metadata?.employer_id?.trim() || undefined;

      if (!employerId) {
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer && typeof sub.customer === "object"
              ? sub.customer.id
              : null;
        if (customerId) {
          const { createAdminClient } = await import("@/lib/supabase/server");
          const supabase = await createAdminClient();
          const { data } = await supabase
            .from("employer_subscriptions")
            .select("employer_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          employerId = data?.employer_id ?? undefined;
        }
      }

      if (!employerId) break;

      const result = await downgradeEmployerToDiscovery(
        employerId,
        event.id,
        event.created
      );
      if (!result.success) {
        throw new Error(result.error ?? "Downgrade failed");
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = getInvoiceSubscriptionRef(invoice);
      if (!subscriptionRef) break;
      await handleInvoicePaid(invoice, event.id);
      const subscription = await retrieveLiveSubscription(
        stripe,
        subscriptionRef
      );
      if (subscription) {
        const result = await syncEmployerSubscriptionFromStripe(
          subscription,
          event.id,
          event.created,
          {
            employer_id: invoice.metadata?.employer_id || undefined,
          }
        );
        if (!result.success) {
          throw new Error(result.error ?? "Invoice paid sync failed");
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await retrieveLiveSubscription(
        stripe,
        getInvoiceSubscriptionRef(invoice)
      );
      await handleInvoicePaymentFailed(
        invoice,
        event.id,
        subscription,
        event.created
      );
      break;
    }

    case "charge.dispute.created":
    case "charge.dispute.updated":
    case "charge.dispute.closed":
    case "charge.dispute.funds_withdrawn": {
      const dispute = event.data.object as Stripe.Dispute;
      await handleChargeDispute(dispute, event.type, event.id, event.created);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const employerId = paymentIntent.metadata?.employer_id;
      const planId = paymentIntent.metadata?.plan_id;

      if (!employerId || !planId) {
        safeError("Stripe webhook: payment_intent missing metadata", {
          id: paymentIntent.id,
        });
        break;
      }

      const result = await syncEmployerSubscription({
        employerId,
        planId,
        stripeCustomerId:
          typeof paymentIntent.customer === "string"
            ? paymentIntent.customer
            : paymentIntent.customer?.id ?? null,
        paymentIntentId: paymentIntent.id,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Legacy PI sync failed");
      }

      safeLog(
        `[Stripe] Webhook processed payment_intent.succeeded ${paymentIntent.id}`
      );
      break;
    }

    default:
      break;
  }
}

export async function POST(request: Request) {
  if (!getStripe() || !process.env.STRIPE_WEBHOOK_SECRET) {
    safeError("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  // Raw body required for signature verification — never use parsed JSON.
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe()!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    safeError("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const claim = await claimStripeWebhookEvent(event);
  if (claim === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    await releaseStripeWebhookEvent(event.id);
    safeError("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
