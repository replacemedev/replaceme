import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";

export type SyncSubscriptionInput = {
  employerId: string;
  planId: string;
  stripeCustomerId?: string | null;
  paymentIntentId?: string;
};

/**
 * Idempotent subscription activation — called only from verified Stripe webhooks
 * or server-side PaymentIntent status checks (never from client-trusted input).
 */
export async function syncEmployerSubscription(
  input: SyncSubscriptionInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();

  if (input.paymentIntentId) {
    const { data: existing } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("action_type", "stripe_payment_processed")
      .eq("target_id", input.paymentIntentId)
      .maybeSingle();

    if (existing) {
      safeLog(
        `[Stripe] Skipping duplicate payment_intent ${input.paymentIntentId}`
      );
      return { success: true };
    }
  }

  const { data: plan, error: planError } = await supabase
    .from("billing_plans")
    .select("id, name, candidate_unlocks")
    .eq("id", input.planId)
    .maybeSingle();

  if (planError || !plan) {
    safeError("syncEmployerSubscription: plan not found", planError);
    return { success: false, error: "Plan not found." };
  }

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: subError } = await supabase.from("employer_subscriptions").upsert(
    {
      employer_id: input.employerId,
      plan_id: plan.id,
      status: "active",
      current_period_end: periodEnd,
      unlocks_used: 0,
      stripe_customer_id: input.stripeCustomerId ?? undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id" }
  );

  if (subError) {
    safeError("syncEmployerSubscription: subscription upsert failed", subError);
    return { success: false, error: "Failed to update subscription." };
  }

  const { data: credits } = await supabase
    .from("employer_credits")
    .select("credits_balance")
    .eq("employer_id", input.employerId)
    .maybeSingle();

  const currentBalance = credits?.credits_balance ?? 0;
  const newBalance = currentBalance + (plan.candidate_unlocks ?? 0);

  const { error: creditError } = await supabase.from("employer_credits").upsert(
    {
      employer_id: input.employerId,
      credits_balance: newBalance,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id" }
  );

  if (creditError) {
    safeError("syncEmployerSubscription: credits upsert failed", creditError);
    return { success: false, error: "Failed to update credits." };
  }

  if (input.paymentIntentId) {
    await supabase.from("audit_logs").insert({
      action_type: "stripe_payment_processed",
      admin_id: input.employerId,
      target_type: "payment_intent",
      target_id: input.paymentIntentId,
      metadata: {
        employer_id: input.employerId,
        plan_id: input.planId,
      },
    });
  }

  safeLog(
    `[Stripe] Subscription synced for employer [REDACTED] plan=${plan.name} pi=${input.paymentIntentId ?? "n/a"}`
  );

  return { success: true };
}

export async function isEmployerSubscriptionActive(
  employerId: string
): Promise<boolean> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("employer_subscriptions")
    .select("status")
    .eq("employer_id", employerId)
    .maybeSingle();

  return data?.status === "active" || data?.status === "trialing";
}
