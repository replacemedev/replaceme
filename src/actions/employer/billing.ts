"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { upgradeCheckoutSchema } from "@/lib/validations/billing";
import { createSubscriptionCheckoutSession } from "@/lib/server/stripe/checkout-session";
import { createBillingPortalSession } from "@/lib/server/stripe/portal-session";
import { getStripe } from "@/lib/server/stripe/client";
import { safeError, safeLog } from "@/utils/logger";
import { AccountSettings, SubscriptionTier } from "@/types/employer/billing";
import { getEmployerPlanUsage as loadEmployerPlanUsage } from "@/lib/server/entitlements";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

const PAID_TIERS = new Set<SubscriptionTier>(["starter", "growth", "scale"]);

function normalizePlanSlug(
  planSlug: string | null | undefined,
  planName: string | null | undefined
): SubscriptionTier {
  const slug = (planSlug ?? planName ?? "discovery").toLowerCase();
  if (
    slug === "discovery" ||
    slug === "starter" ||
    slug === "growth" ||
    slug === "scale"
  ) {
    return slug;
  }
  if (slug === "essential") return "starter";
  if (slug === "professional") return "growth";
  return "discovery";
}

export async function getEmployerPlanUsage(): Promise<EmployerPlanUsage | null> {
  const { profile } = await requireRole("employer");
  return loadEmployerPlanUsage(profile.id);
}

export async function getAccountSettings(): Promise<AccountSettings | null> {
  try {
    const { supabase, profile } = await requireRole("employer");

    const { data: subscription, error: subError } = await supabase
      .from("employer_subscriptions")
      .select(`
        status,
        plan_slug,
        current_period_end,
        billing_period_end,
        cancel_at_period_end,
        stripe_subscription_id,
        unlocks_used,
        billing_plans!employer_subscriptions_plan_id_fkey (
          name,
          slug,
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
        cancelAtPeriodEnd: false,
        hasStripeSubscription: false,
      };
    }

    const billingPlan = subscription.billing_plans as {
      name?: string;
      slug?: string;
      candidate_unlocks?: number;
    } | null;

    const plan = normalizePlanSlug(
      subscription.plan_slug ?? billingPlan?.slug,
      billingPlan?.name
    );
    const unlocksTotal = billingPlan?.candidate_unlocks ?? 5;
    const periodEnd =
      subscription.billing_period_end ?? subscription.current_period_end;

    return {
      plan,
      unlocksUsed: subscription.unlocks_used,
      unlocksTotal,
      active:
        subscription.status === "active" || subscription.status === "trialing",
      nextBillingDate: periodEnd
        ? new Date(periodEnd).toISOString().split("T")[0]
        : null,
      status:
        subscription.status.charAt(0).toUpperCase() +
        subscription.status.slice(1),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hasStripeSubscription: Boolean(subscription.stripe_subscription_id),
    };
  } catch {
    return null;
  }
}

/**
 * Creates a Stripe Checkout Session — does NOT mutate subscription state.
 * Activation happens via webhook after payment succeeds.
 */
export async function createUpgradeCheckout(planId: string) {
  const result = await runAction("createUpgradeCheckout", async () => {
    const parsed = upgradeCheckoutSchema.parse({ planId });
    safeLog(`[Billing] Checkout session for plan: ${parsed.planId}`);

    const { user, profile } = await requireRole("employer");

    if (!getStripe()) {
      return fail(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
      );
    }

    const { data: employerProfile } = await (
      await createClient()
    )
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", profile.id)
      .single();

    const name =
      `${employerProfile?.first_name || ""} ${employerProfile?.last_name || ""}`.trim() ||
      "Employer";

    const session = await createSubscriptionCheckoutSession({
      employerId: profile.id,
      email: user.email || "",
      name,
      planRef: parsed.planId,
    });

    if ("error" in session) {
      return fail(session.error);
    }

    return ok({ checkoutUrl: session.checkoutUrl });
  });

  if (!result.success) return { error: result.error };
  return { success: true as const, checkoutUrl: result.data?.checkoutUrl };
}

export async function createCustomerPortalSession() {
  const result = await runAction("createCustomerPortalSession", async () => {
    const { user, profile } = await requireRole("employer");

    if (!getStripe()) {
      return fail("Stripe is not configured.");
    }

    const { data: employerProfile } = await (
      await createClient()
    )
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", profile.id)
      .single();

    const name =
      `${employerProfile?.first_name || ""} ${employerProfile?.last_name || ""}`.trim() ||
      "Employer";

    const session = await createBillingPortalSession({
      employerId: profile.id,
      email: user.email || "",
      name,
    });

    if ("error" in session) {
      return fail(session.error);
    }

    return ok({ portalUrl: session.portalUrl });
  });

  if (!result.success) return { error: result.error };
  return { success: true as const, portalUrl: result.data?.portalUrl };
}

export async function cancelSubscription() {
  const result = await runAction("cancelSubscription", async () => {
    safeLog("[Billing] Cancel subscription initiated");
    const { profile } = await requireRole("employer");
    const admin = await createAdminClient();

    const { data: subscription } = await admin
      .from("employer_subscriptions")
      .select("stripe_subscription_id, plan_slug")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const planSlug = normalizePlanSlug(subscription?.plan_slug, null);
    if (!PAID_TIERS.has(planSlug)) {
      return fail("No active paid subscription to cancel.");
    }

    const stripe = getStripe();
    if (stripe && subscription?.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    const { error: cancelError } = await admin
      .from("employer_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", profile.id);

    if (cancelError) {
      return fail("Failed to cancel subscription in database.");
    }

    revalidatePath("/employer/settings/account");
    return ok({
      message:
        "Your subscription will cancel at the end of the current billing period.",
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
      .select(`status, plan_slug, billing_plans!employer_subscriptions_plan_id_fkey (name, slug)`)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (!subscription) {
      return { planName: "Discovery", active: false };
    }

    const billingPlan = subscription.billing_plans as {
      name?: string;
      slug?: string;
    } | null;
    const slug = normalizePlanSlug(
      subscription.plan_slug ?? billingPlan?.slug,
      billingPlan?.name
    );
    const planName =
      billingPlan?.name ??
      slug.charAt(0).toUpperCase() + slug.slice(1);
    const active =
      subscription.status === "active" || subscription.status === "trialing";

    return { planName, active };
  } catch (err) {
    safeError("getCurrentEmployerSubscription error:", err);
    return null;
  }
}
