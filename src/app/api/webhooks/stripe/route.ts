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
} from "@/lib/server/stripe/sync-subscription";
import { safeError, safeLog } from "@/utils/logger";

async function retrieveSubscription(
  stripe: Stripe,
  subscriptionRef: string | Stripe.Subscription | null | undefined
): Promise<Stripe.Subscription | null> {
  if (!subscriptionRef) return null;
  if (typeof subscriptionRef !== "string") return subscriptionRef;
  return stripe.subscriptions.retrieve(subscriptionRef);
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const subscription = await retrieveSubscription(
        stripe,
        session.subscription
      );
      if (subscription) {
        const result = await syncEmployerSubscriptionFromStripe(
          subscription,
          event.id
        );
        if (!result.success) {
          throw new Error(result.error ?? "Subscription sync failed");
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const result = await syncEmployerSubscriptionFromStripe(
        subscription,
        event.id
      );
      if (!result.success) {
        throw new Error(result.error ?? "Subscription sync failed");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const employerId = subscription.metadata?.employer_id;
      if (!employerId) break;

      const result = await downgradeEmployerToDiscovery(employerId, event.id);
      if (!result.success) {
        throw new Error(result.error ?? "Downgrade failed");
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const subscription = await retrieveSubscription(
        stripe,
        invoice.subscription
      );
      if (subscription) {
        const result = await syncEmployerSubscriptionFromStripe(
          subscription,
          event.id
        );
        if (!result.success) {
          throw new Error(result.error ?? "Past-due sync failed");
        }
      }
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
