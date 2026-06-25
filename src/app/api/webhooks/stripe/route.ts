import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { syncEmployerSubscription } from "@/lib/server/stripe/sync-subscription";
import { safeError, safeLog } from "@/utils/logger";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    })
  : null;

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
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

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const employerId = paymentIntent.metadata?.employer_id;
      const planId = paymentIntent.metadata?.plan_id;

      if (!employerId || !planId) {
        safeError("Stripe webhook: payment_intent missing metadata", {
          id: paymentIntent.id,
        });
        return NextResponse.json({ received: true });
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
        safeError("Stripe webhook: sync failed", result.error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
      }

      safeLog(`[Stripe] Webhook processed payment_intent.succeeded ${paymentIntent.id}`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const employerId = subscription.metadata?.employer_id;
      if (employerId) {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminClient();
        await supabase
          .from("employer_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("employer_id", employerId);
      }
    }
  } catch (err) {
    safeError("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
