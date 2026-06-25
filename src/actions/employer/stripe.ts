"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth/session";
import { planIdSchema, paymentIntentIdSchema } from "@/lib/validations/stripe";
import { syncEmployerSubscription } from "@/lib/server/stripe/sync-subscription";
import { safeError, safeLog } from "@/utils/logger";
import Stripe from "stripe";

// Initialize Stripe gracefully
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    })
  : null;

/**
 * Creates a Stripe Subscription PaymentIntent.
 * Returns the clientSecret and verified plan price/name details.
 */
export async function createStripeSubscription(
  planId: string
): Promise<{ clientSecret: string | null; planName?: string; planPrice?: number; error?: string }> {
  try {
    const parsed = planIdSchema.parse({ planId });
    safeLog(`[Stripe] Initiating subscription setup for plan: ${parsed.planId}`);

    const { supabase, user, profile } = await requireRole("employer");

    const { data: employerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", profile.id)
      .single();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        parsed.planId
      );
    let planQuery = supabase.from("billing_plans").select("id, price, name");

    if (isUuid) {
      planQuery = planQuery.eq("id", parsed.planId);
    } else {
      planQuery = planQuery.ilike("name", parsed.planId);
    }

    const { data: plan, error: planError } = await planQuery.maybeSingle();

    if (planError || !plan) {
      safeError(`Billing plan not found in DB: ${parsed.planId}`, planError);
      return { clientSecret: null, error: "Billing plan not found." };
    }

    const priceInCents = Math.round(Number(plan.price) * 100);

    if (!stripe) {
      return {
        clientSecret: null,
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY and use Stripe test mode.",
      };
    }

    const { data: sub } = await supabase
      .from("employer_subscriptions")
      .select("stripe_customer_id")
      .eq("employer_id", profile.id)
      .maybeSingle();

    let stripeCustomerId = sub?.stripe_customer_id;

    if (!stripeCustomerId) {
      const email = user.email || "";
      const name =
        `${employerProfile?.first_name || ""} ${employerProfile?.last_name || ""}`.trim() ||
        "Employer";

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { employer_id: profile.id },
      });
      stripeCustomerId = customer.id;

      const admin = await createAdminClient();
      const { error: upsertError } = await admin
        .from("employer_subscriptions")
        .upsert(
          {
            employer_id: profile.id,
            stripe_customer_id: stripeCustomerId,
            status: "inactive",
          },
          { onConflict: "employer_id" }
        );

      if (upsertError) {
        safeError("Failed to save stripe_customer_id:", upsertError);
      }
    }

    const intent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        employer_id: profile.id,
        plan_id: plan.id,
        plan_name: plan.name,
      },
      automatic_payment_methods: { enabled: true },
    });

    safeLog("[Stripe] Created PaymentIntent for customer [REDACTED]");

    return {
      clientSecret: intent.client_secret,
      planName: plan.name,
      planPrice: Number(plan.price),
    };
  } catch (err) {
    safeError("createStripeSubscription error occurred: [REDACTED_STRIPE_ERROR_DETAILS]");
    return {
      clientSecret: null,
      error: "An unexpected error occurred while setting up the checkout payment.",
    };
  }
}

/**
 * Creates a Stripe PaymentIntent for plan upgrade.
 * Supports linking checkout to a target applicant profile for immediate unlock post-payment.
 */
export async function createStripeCheckoutIntent(
  planId: string,
  targetApplicantId?: string
): Promise<{ clientSecret: string | null; error?: string }> {
  try {
    safeLog(`[Stripe] Initiating checkout intent for plan: ${planId}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { clientSecret: null, error: "Authentication failed. Please log in." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { clientSecret: null, error: "Access denied. Only employers can upgrade." };
    }

    // Check if the planId is a valid UUID, otherwise query by name
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);
    let planQuery = supabase.from("billing_plans").select("id, price, name");

    if (isUuid) {
      planQuery = planQuery.eq("id", planId);
    } else {
      planQuery = planQuery.ilike("name", planId);
    }

    const { data: plan, error: planError } = await planQuery.maybeSingle();

    if (planError || !plan) {
      safeError("Billing plan not found in DB:", planError);
      return { clientSecret: null, error: "Billing plan not found." };
    }

    const priceInCents = Math.round(Number(plan.price) * 100);

    if (!stripe) {
      return {
        clientSecret: null,
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY and use Stripe test mode.",
      };
    }

    // Create real Stripe PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: "usd",
      metadata: {
        employer_id: profile.id,
        plan_id: plan.id,
        plan_name: plan.name,
        target_applicant_id: targetApplicantId || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: intent.client_secret,
    };
  } catch (err) {
    safeError("createStripeCheckoutIntent error occurred: [REDACTED_STRIPE_ERROR_DETAILS]");
    return {
      clientSecret: null,
      error: "An unexpected error occurred while setting up the checkout payment.",
    };
  }
}

/**
 * Server-side reconciliation after client payment confirmation.
 * Verifies PaymentIntent status with Stripe API — never trusts client alone.
 * Webhook remains the primary sync path; this handles race conditions in UI.
 */
export async function reconcilePaymentIntent(
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = paymentIntentIdSchema.parse({ paymentIntentId });
    const { profile } = await requireRole("employer");

    if (!stripe) {
      return {
        success: false,
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      };
    }

    const intent = await stripe.paymentIntents.retrieve(parsed.paymentIntentId);

    if (intent.status !== "succeeded") {
      return { success: false, error: "Payment has not completed yet." };
    }

    if (intent.metadata?.employer_id !== profile.id) {
      return { success: false, error: "Payment does not belong to this account." };
    }

    const planId = intent.metadata?.plan_id;
    if (!planId) {
      return { success: false, error: "Payment metadata is invalid." };
    }

    const result = await syncEmployerSubscription({
      employerId: profile.id,
      planId,
      stripeCustomerId:
        typeof intent.customer === "string" ? intent.customer : intent.customer?.id,
      paymentIntentId: intent.id,
    });

    return result;
  } catch (err) {
    safeError("reconcilePaymentIntent error:", err);
    return { success: false, error: "Failed to verify payment." };
  }
}
