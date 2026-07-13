"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { upgradeCheckoutSchema } from "@/lib/validations/billing";
import { createSubscriptionCheckoutSession } from "@/lib/server/stripe/checkout-session";
import { changeEmployerSubscription } from "@/lib/server/stripe/change-subscription";
import { createBillingPortalSession } from "@/lib/server/stripe/portal-session";
import { getStripe } from "@/lib/server/stripe/client";
import { safeError, safeLog } from "@/utils/logger";
import { AccountSettings, SubscriptionTier } from "@/types/employer/billing";
import { getEmployerPlanUsage as loadEmployerPlanUsage } from "@/lib/server/entitlements";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import type { EmployerInvoiceRow } from "@/lib/server/stripe/list-invoices";
import { getSiteUrl } from "@/lib/auth/site-url";
import { resolveBillingPlan, resolveStripePriceIdFromEnv } from "@/lib/server/stripe/plan";

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
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hasStripeSubscription: Boolean(subscription.stripe_subscription_id),
      scheduledPlan,
      scheduledEffectiveAt: subscription.scheduled_effective_at,
    };
  } catch {
    return null;
  }
}

type UpgradeCheckoutData = {
  upgraded: boolean;
  downgradeScheduled?: boolean;
  checkoutUrl?: string;
  planSlug?: string;
  message?: string;
  effectiveAt?: string;
};

/**
 * Change plan: immediate in-place upgrade, period-end scheduled downgrade,
 * or Checkout only when the employer has no active paid subscription.
 * @see https://docs.stripe.com/billing/subscriptions/change-price
 * @see https://docs.stripe.com/billing/subscriptions/subscription-schedules
 */
export async function createUpgradeCheckout(planId: string) {
  const result = await runAction("createUpgradeCheckout", async () => {
    const parsed = upgradeCheckoutSchema.parse({ planId });
    safeLog(`[Billing] Plan change requested: ${parsed.planId}`);

    const { user, profile } = await requireRole("employer");

    if (!getStripe()) {
      return fail(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
      );
    }

    const plan = await resolveBillingPlan(parsed.planId);
    if (!plan) {
      return fail("Billing plan not found.");
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: subscription } = await supabase
      .from("employer_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, status")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const subscriptionId = subscription?.stripe_subscription_id?.trim() || null;
    const customerId = subscription?.stripe_customer_id?.trim() || null;
    const status = subscription?.status || null;
    const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
    const hasActiveSub = subscriptionId && status && ACTIVE_STATUSES.has(status);

    if (hasActiveSub) {
      const stripe = getStripe()!;
      const liveSub = await stripe.subscriptions.retrieve(subscriptionId);
      const item = liveSub.items.data[0];
      if (!item) {
        return fail("No active subscription item found.");
      }
      const priceId = plan.stripe_price_id ?? resolveStripePriceIdFromEnv(plan.slug ?? "");
      if (!priceId) {
        return fail("Target plan is missing a Stripe price ID.");
      }

      const siteUrl = getSiteUrl();
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId!,
        return_url: `${siteUrl}/employer/settings/account`,
        flow_data: {
          type: "subscription_update_confirm",
          subscription_update_confirm: {
            subscription: subscriptionId,
            items: [
              {
                id: item.id,
                price: priceId,
              },
            ],
          },
        },
      });

      return ok<UpgradeCheckoutData>({
        upgraded: false,
        checkoutUrl: portalSession.url,
      });
    }

    const { data: employerProfile } = await (
      await createClient()
    )
      .from("profiles")
      .select("first_name, middle_name, last_name")
      .eq("id", profile.id)
      .single();

    const name =
      formatFullName(employerProfile?.first_name, employerProfile?.middle_name, employerProfile?.last_name) ||
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

    return ok<UpgradeCheckoutData>({
      upgraded: false,
      checkoutUrl: session.checkoutUrl,
    });
  });

  if (!result.success) return { error: result.error };
  return {
    success: true as const,
    upgraded: result.data?.upgraded ?? false,
    downgradeScheduled: result.data?.downgradeScheduled ?? false,
    checkoutUrl: result.data?.checkoutUrl,
    planSlug: result.data?.planSlug,
    message: result.data?.message,
    effectiveAt: result.data?.effectiveAt,
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
      formatFullName(employerProfile?.first_name, employerProfile?.middle_name, employerProfile?.last_name) ||
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
    safeLog("[Billing] Cancel subscription portal session initiated");
    const { profile } = await requireRole("employer");
    const admin = await createAdminClient();

    const { data: subscription } = await admin
      .from("employer_subscriptions")
      .select(
        "stripe_subscription_id, stripe_customer_id, plan_slug"
      )
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
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/employer/settings/account`,
      flow_data: {
        type: "subscription_cancel",
        subscription_cancel: {
          subscription: subscriptionId,
        },
      },
    });

    return ok({ portalUrl: session.url });
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

  if (!result.success) return { error: result.error, invoices: [] as EmployerInvoiceRow[] };
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
