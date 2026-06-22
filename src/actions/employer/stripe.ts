"use server";

import { createClient } from "@/lib/supabase/server";
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
    safeLog(`[Stripe] Initiating subscription setup for plan: ${planId}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { clientSecret: null, error: "Authentication failed. Please log in." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { clientSecret: null, error: "Access denied. Only employers can subscribe." };
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
      safeError(`Billing plan not found in DB: ${planId}`, planError);
      return { clientSecret: null, error: "Billing plan not found." };
    }

    const priceInCents = Math.round(Number(plan.price) * 100);

    // If Stripe is not initialized, return simulated clientSecret for local dev flow
    if (!stripe) {
      safeLog("[Stripe] STRIPE_SECRET_KEY is missing. Returning simulated client secret.");
      return {
        clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(2),
        planName: plan.name,
        planPrice: Number(plan.price),
      };
    }

    // Retrieve or create Stripe Customer for the current employer
    const { data: sub } = await supabase
      .from("employer_subscriptions")
      .select("stripe_customer_id")
      .eq("employer_id", profile.id)
      .maybeSingle();

    let stripeCustomerId = sub?.stripe_customer_id;

    if (!stripeCustomerId) {
      const email = user.email || "";
      const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Employer";
      
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          employer_id: profile.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID in the database
      const { error: upsertError } = await supabase
        .from("employer_subscriptions")
        .upsert({
          employer_id: profile.id,
          stripe_customer_id: stripeCustomerId,
          status: "inactive",
        }, { onConflict: "employer_id" });

      if (upsertError) {
        safeError("Failed to save stripe_customer_id:", upsertError);
      }
    }

    // Create Stripe PaymentIntent associated with the customer
    const intent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        employer_id: profile.id,
        plan_id: plan.id,
        plan_name: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Redact secret key in logs
    safeLog(`[Stripe] Created PaymentIntent for customer [REDACTED]`);

    return {
      clientSecret: intent.client_secret,
      planName: plan.name,
      planPrice: Number(plan.price),
    };
  } catch (err) {
    // Redact Stripe ID leaks in error logs
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

    // If Stripe is not initialized, return a simulated clientSecret for dev flow
    if (!stripe) {
      safeLog("[Stripe] STRIPE_SECRET_KEY is missing. Returning simulated client secret.");
      return {
        clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(2),
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
 * Handle subscription update upon successful payment confirmation.
 */
export async function confirmStripeSubscriptionPayment(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication failed." };
    }

    // Check if the planId is a valid UUID, otherwise query by name
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);
    let planQuery = supabase.from("billing_plans").select("id, name, candidate_unlocks");

    if (isUuid) {
      planQuery = planQuery.eq("id", planId);
    } else {
      planQuery = planQuery.ilike("name", planId);
    }

    const { data: plan, error: planError } = await planQuery.maybeSingle();

    if (planError || !plan) {
      return { success: false, error: "Plan not found." };
    }

    // 1. Update subscription status in DB
    const { error: subError } = await supabase
      .from("employer_subscriptions")
      .upsert({
        employer_id: user.id,
        plan_id: plan.id,
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "employer_id" });

    if (subError) {
      safeError("Error updating subscription status:", subError);
      return { success: false, error: "Failed to update subscription details." };
    }

    // 2. Add unlock credits to employer balance
    const { data: credits } = await supabase
      .from("employer_credits")
      .select("credits_balance")
      .eq("employer_id", user.id)
      .maybeSingle();

    const currentBalance = credits?.credits_balance || 0;
    const newBalance = currentBalance + plan.candidate_unlocks;

    const { error: creditError } = await supabase
      .from("employer_credits")
      .upsert({
        employer_id: user.id,
        credits_balance: newBalance,
        updated_at: new Date().toISOString(),
      }, { onConflict: "employer_id" });

    if (creditError) {
      safeError("Error updating credits balance:", creditError);
      return { success: false, error: "Failed to update credit balance." };
    }

    return { success: true };
  } catch (err) {
    safeError("confirmStripeSubscriptionPayment error:", err);
    return { success: false, error: "Unexpected error confirming payment." };
  }
}
