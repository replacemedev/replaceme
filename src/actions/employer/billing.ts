"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { upgradeCheckoutSchema } from "@/lib/validations/billing";
import { safeError, safeLog } from "@/utils/logger";
import { AccountSettings, SubscriptionTier } from "@/types/employer/billing";

export async function getAccountSettings(): Promise<AccountSettings | null> {
  try {
    const { supabase, profile } = await requireRole("employer");

    const { data: subscription, error: subError } = await supabase
      .from("employer_subscriptions")
      .select(`
        status,
        current_period_end,
        unlocks_used,
        billing_plans (
          name,
          candidate_unlocks
        )
      `)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (subError) {
      safeError("Error fetching subscription:", subError);
      return null;
    }

    if (!subscription) {
      return {
        plan: "discovery",
        unlocksUsed: 0,
        unlocksTotal: 5,
        active: true,
        nextBillingDate: null,
        status: "Active",
      };
    }

    const planName =
      (subscription.billing_plans as { name?: string })?.name?.toLowerCase() ||
      "discovery";
    const unlocksTotal =
      (subscription.billing_plans as { candidate_unlocks?: number })
        ?.candidate_unlocks || 5;

    return {
      plan: planName as SubscriptionTier,
      unlocksUsed: subscription.unlocks_used,
      unlocksTotal,
      active:
        subscription.status === "active" || subscription.status === "trialing",
      nextBillingDate: subscription.current_period_end
        ? new Date(subscription.current_period_end).toISOString().split("T")[0]
        : null,
      status:
        subscription.status.charAt(0).toUpperCase() +
        subscription.status.slice(1),
    };
  } catch {
    return null;
  }
}

/**
 * Redirects to Stripe checkout — does NOT mutate subscription state.
 * Subscription activation happens via webhook after payment succeeds.
 */
export async function createUpgradeCheckout(planId: string) {
  const result = await runAction("createUpgradeCheckout", async () => {
    const parsed = upgradeCheckoutSchema.parse({ planId });
    safeLog(`[Billing] Checkout redirect for plan: ${parsed.planId}`);
    await requireRole("employer");
    return ok({ checkoutUrl: `/employer/pricing?plan=${parsed.planId}` });
  });

  if (!result.success) return { error: result.error };
  return { success: true as const, checkoutUrl: result.data?.checkoutUrl };
}

export async function cancelSubscription() {
  const result = await runAction("cancelSubscription", async () => {
    safeLog("[Billing] Cancel subscription initiated");
    const { supabase, profile } = await requireRole("employer");

    const { error: cancelError } = await supabase
      .from("employer_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", profile.id);

    if (cancelError) {
      return fail("Failed to cancel subscription in database.");
    }

    revalidatePath("/employer/settings/account");
    return ok({
      message:
        "Your subscription has been cancelled. Access remains until the current billing cycle ends.",
    });
  });

  if (!result.success) return { error: result.error };
  return { success: true as const, message: result.data?.message };
}

export async function getCurrentEmployerSubscription(): Promise<{
  planName: string;
  active: boolean;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "employer") return null;

    const { data: subscription } = await supabase
      .from("employer_subscriptions")
      .select(`status, billing_plans (name)`)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (!subscription) {
      return { planName: "Discovery", active: false };
    }

    const planName =
      (subscription.billing_plans as { name?: string })?.name || "Discovery";
    const active =
      subscription.status === "active" || subscription.status === "trialing";

    return { planName, active };
  } catch (err) {
    safeError("getCurrentEmployerSubscription error:", err);
    return null;
  }
}
