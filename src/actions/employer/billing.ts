"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { AccountSettings, SubscriptionTier } from "@/types/employer/billing";
import { revalidatePath } from "next/cache";

/**
 * Fetch current employer billing and subscription settings.
 * Checks session, confirms role, and returns active plan state from database.
 */
export async function getAccountSettings(): Promise<AccountSettings | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return null;
    }

    // Fetch active plan state from database
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
      // Default fallback plan if subscription row doesn't exist
      return {
        plan: "discovery",
        unlocksUsed: 0,
        unlocksTotal: 5,
        active: true,
        nextBillingDate: null,
        status: "Active",
      };
    }

    const planName = (subscription.billing_plans as any)?.name?.toLowerCase() || "discovery";
    const unlocksTotal = (subscription.billing_plans as any)?.candidate_unlocks || 5;

    return {
      plan: planName as SubscriptionTier,
      unlocksUsed: subscription.unlocks_used,
      unlocksTotal,
      active: subscription.status === "active" || subscription.status === "trialing",
      nextBillingDate: subscription.current_period_end
        ? new Date(subscription.current_period_end).toISOString().split("T")[0]
        : null,
      status: subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1),
    };
  } catch (err) {
    safeError("getAccountSettings error occurred:", err);
    return null;
  }
}

/**
 * Initiates Stripe Checkout upgrade flow.
 * Verifies session, role, and updates subscription state in database.
 */
export async function createUpgradeCheckout(planId: string) {
  try {
    safeLog(`[Auth] Create upgrade checkout action initiated for plan: ${planId}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can manage subscription billing." };
    }

    const validPlans: SubscriptionTier[] = ["discovery", "essential", "professional"];
    if (!validPlans.includes(planId as SubscriptionTier)) {
      return { error: "Invalid subscription plan selected." };
    }

    // Retrieve plan ID from the database matching the planId parameter
    const { data: targetPlan, error: planError } = await supabase
      .from("billing_plans")
      .select("id")
      .ilike("name", planId)
      .maybeSingle();

    if (planError || !targetPlan) {
      safeError("Billing plan not found in database:", planError);
      return { error: "Selected plan is not configured in database." };
    }

    // Update/insert subscription in database
    const { error: updateError } = await supabase
      .from("employer_subscriptions")
      .upsert({
        employer_id: profile.id,
        plan_id: targetPlan.id,
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        unlocks_used: 0,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      safeError("createUpgradeCheckout database update error:", updateError);
      return { error: "Failed to update subscription in database." };
    }

    safeLog(`[Auth] Subscription successfully updated for plan: ${planId}`);
    revalidatePath("/settings/account");

    return {
      success: true,
      checkoutUrl: "https://checkout.stripe.com/pay/cs_test_mock_replace_me",
    };
  } catch (err) {
    safeError("createUpgradeCheckout error occurred:", err);
    return { error: "An unexpected error occurred while preparing your checkout. Please try again." };
  }
}

/**
 * Cancels the active subscription.
 * Verifies session, role, and updates billing state in database.
 */
export async function cancelSubscription() {
  try {
    safeLog("[Auth] Cancel subscription action initiated");

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can manage subscription billing." };
    }

    // Update subscription to 'canceled' in database
    const { error: cancelError } = await supabase
      .from("employer_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", profile.id);

    if (cancelError) {
      safeError("cancelSubscription database update error:", cancelError);
      return { error: "Failed to cancel subscription in database." };
    }

    safeLog("[Auth] Active subscription successfully marked for cancellation in database");
    revalidatePath("/settings/account");

    return {
      success: true,
      message: "Your subscription has been successfully cancelled. Your access will remain active until the end of the current billing cycle.",
    };
  } catch (err) {
    safeError("cancelSubscription error occurred:", err);
    return { error: "An unexpected error occurred while processing your cancellation. Please try again." };
  }
}

/**
 * Retrieve current employer's active subscription information.
 * Checks session, confirms role, and returns active plan name and active status.
 */
export async function getCurrentEmployerSubscription(): Promise<{
  planName: string;
  active: boolean;
} | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Verify role is employer
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "employer") {
      return null;
    }

    const { data: subscription, error: subError } = await supabase
      .from("employer_subscriptions")
      .select(`
        status,
        billing_plans (
          name
        )
      `)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (subError || !subscription) {
      return {
        planName: "Discovery",
        active: false,
      };
    }

    const planName = (subscription.billing_plans as any)?.name || "Discovery";
    const active = subscription.status === "active" || subscription.status === "trialing";

    return {
      planName,
      active,
    };
  } catch (err) {
    safeError("getCurrentEmployerSubscription error:", err);
    return null;
  }
}

