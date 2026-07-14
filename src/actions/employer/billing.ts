"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { upgradeCheckoutSchema } from "@/lib/validations/billing";
import { createPlanChangeSession } from "@/lib/server/stripe/plan-change-session";
import { createBillingPortalSession } from "@/lib/server/stripe/portal-session";
import { getStripe } from "@/lib/server/stripe/client";
import { safeError, safeLog } from "@/utils/logger";
import { AccountSettings, SubscriptionTier } from "@/types/employer/billing";
import { getEmployerPlanUsage as loadEmployerPlanUsage } from "@/lib/server/entitlements";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import type { EmployerInvoiceRow } from "@/lib/server/stripe/list-invoices";
import { getSiteUrl } from "@/lib/auth/site-url";

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
        scheduled_plan_slug,
        scheduled_effective_at,
        last_payment_error,
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
        statusRaw: "active",
        cancelAtPeriodEnd: false,
        hasStripeSubscription: false,
        lastPaymentError: null,
        scheduledPlan: null,
        scheduledEffectiveAt: null,
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

    const scheduledRaw = subscription.scheduled_plan_slug;
    const scheduledPlan =
      scheduledRaw && PAID_TIERS.has(normalizePlanSlug(scheduledRaw, null))
        ? normalizePlanSlug(scheduledRaw, null)
        : scheduledRaw?.toLowerCase() === "discovery"
          ? ("discovery" as const)
          : null;

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
      statusRaw: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hasStripeSubscription: Boolean(subscription.stripe_subscription_id),
      lastPaymentError: subscription.last_payment_error ?? null,
      scheduledPlan,
      scheduledEffectiveAt: subscription.scheduled_effective_at,
    };
  } catch {
    return null;
  }
}

type UpgradeCheckoutData = {
  checkoutUrl: string;
  mode: "checkout" | "portal_update";
  planSlug: string;
};

/**
 * Manage Plan: never mutates Stripe subscriptions directly.
 * Returns a Checkout URL (first paid) or Customer Portal confirm URL
 * (existing subscription). DB tier updates only via webhooks.
 *
 * @see https://docs.stripe.com/customer-management/portal-deep-links
 * @see https://docs.stripe.com/payments/checkout
 */
export async function createUpgradeCheckout(planId: string) {
  const result = await runAction("createUpgradeCheckout", async () => {
    const parsed = upgradeCheckoutSchema.parse({ planId });
    safeLog(`[Billing] Plan change session requested: ${parsed.planId}`);

    const { user, profile } = await requireRole("employer");

    if (!getStripe()) {
      return fail(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
      );
    }

    const supabase = await createClient();
    const { data: employerProfile } = await supabase
      .from("profiles")
      .select("first_name, middle_name, last_name")
      .eq("id", profile.id)
      .single();

    const name =
      formatFullName(
        employerProfile?.first_name,
        employerProfile?.middle_name,
        employerProfile?.last_name
      ) || "Employer";

    const session = await createPlanChangeSession({
      employerId: profile.id,
      email: user.email || "",
      name,
      planRef: parsed.planId,
    });

    if ("error" in session) {
      return fail(session.error);
    }

    return ok<UpgradeCheckoutData>({
      checkoutUrl: session.url,
      mode: session.mode,
      planSlug: session.planSlug,
    });
  });

  if (!result.success) return { error: result.error };
  return {
    success: true as const,
    checkoutUrl: result.data?.checkoutUrl,
    mode: result.data?.mode,
    planSlug: result.data?.planSlug,
  };
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
      .select("first_name, middle_name, last_name")
      .eq("id", profile.id)
      .single();

    const name =
      formatFullName(
        employerProfile?.first_name,
        employerProfile?.middle_name,
        employerProfile?.last_name
      ) || "Employer";

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

/**
 * Cancel → Discovery: portal deep link `subscription_cancel`.
 * Does not mutate cancel_at_period_end in-app — webhook syncs after Stripe confirm.
 */
export async function cancelSubscription() {
  const result = await runAction("cancelSubscription", async () => {
    safeLog("[Billing] Cancel subscription portal session initiated");
    const { profile } = await requireRole("employer");
    const admin = await createAdminClient();

    const { data: subscription } = await admin
      .from("employer_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, plan_slug")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const subscriptionId = subscription?.stripe_subscription_id?.trim() || null;
    const customerId = subscription?.stripe_customer_id?.trim() || null;
    const planSlug = normalizePlanSlug(subscription?.plan_slug, null);

    if (!PAID_TIERS.has(planSlug) || !subscriptionId || !customerId) {
      return fail("No active paid subscription to cancel.");
    }

    const stripe = getStripe();
    if (!stripe) {
      return fail("Stripe is not configured.");
    }

    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/employer/settings/account`;

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
        flow_data: {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: subscriptionId,
          },
          after_completion: {
            type: "redirect",
            redirect: { return_url: returnUrl },
          },
        },
      });

      if (!session.url) {
        return fail("Stripe did not return a portal URL.");
      }

      return ok({ portalUrl: session.url });
    } catch (err) {
      safeError("[Billing] cancel portal session failed", err);
      return fail(
        "Could not open Stripe to confirm cancellation. Please try Manage billing."
      );
    }
  });

  if (!result.success) return { error: result.error };
  return { success: true as const, portalUrl: result.data?.portalUrl };
}

export async function listEmployerInvoices() {
  const result = await runAction("listEmployerInvoices", async () => {
    const { profile } = await requireRole("employer");
    if (!getStripe()) {
      return fail("Stripe is not configured.");
    }
    const { listInvoicesForEmployer } = await import(
      "@/lib/server/stripe/list-invoices"
    );
    const listed = await listInvoicesForEmployer(profile.id);
    if ("error" in listed) return fail(listed.error);
    return ok({ invoices: listed.invoices });
  });

  if (!result.success)
    return { error: result.error, invoices: [] as EmployerInvoiceRow[] };
  return {
    success: true as const,
    invoices: result.data?.invoices ?? [],
  };
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
      .select(
        `status, plan_slug, billing_plans!employer_subscriptions_plan_id_fkey (name, slug)`
      )
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
      billingPlan?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
    const active =
      subscription.status === "active" || subscription.status === "trialing";

    return { planName, active };
  } catch (err) {
    safeError("getCurrentEmployerSubscription error:", err);
    return null;
  }
}
