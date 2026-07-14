"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/server/stripe/client";
import { monthlyMrrCents } from "@/lib/server/stripe/subscription-price";
import { recordBillingLedgerEvent } from "@/lib/server/stripe/billing-ledger";
import { invalidateEmployerCache } from "@/lib/server/entitlements";
import { fetchAdminSubscriptions, logAdminAction } from "@/actions/admin-actions";
import {
  adminIssueRefundSchema,
  adminPlanOverrideSchema,
  adminRevokePlanOverrideSchema,
  type AdminBillingLedgerRow,
  type AdminBillingMetrics,
  type AdminBillingPageData,
  type AdminBillingTierBreakdown,
  type AdminSubscriptionRow,
} from "@/types/admin.types";
import { safeError } from "@/utils/logger";

const TIER_LABELS: Record<string, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

type ActionResult = { success: true } | { success: false; error: string };

function subscriptionMrrCents(sub: AdminSubscriptionRow): number {
  if (sub.status !== "active" && sub.status !== "trialing") return 0;

  if (sub.unit_amount_cents) {
    return monthlyMrrCents(sub.unit_amount_cents, sub.billing_interval);
  }

  if (sub.plan_price) {
    return Math.round(sub.plan_price * 100);
  }

  return 0;
}

function buildMetrics(subscriptions: AdminSubscriptionRow[]): AdminBillingMetrics {
  const active = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trialing"
  );

  const tierMap = new Map<string, AdminBillingTierBreakdown>();

  for (const sub of active) {
    const slug = sub.plan_slug ?? "discovery";
    const existing = tierMap.get(slug) ?? {
      plan_slug: slug,
      label: TIER_LABELS[slug] ?? slug,
      count: 0,
      mrr_cents: 0,
    };
    existing.count += 1;
    existing.mrr_cents += subscriptionMrrCents(sub);
    tierMap.set(slug, existing);
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const failedPayments30d = subscriptions.filter((s) => {
    if (s.last_payment_status !== "failed" || !s.last_payment_at) return false;
    return new Date(s.last_payment_at).getTime() >= thirtyDaysAgo;
  }).length;

  const atRiskCount = subscriptions.filter(
    (s) =>
      s.status === "past_due" ||
      s.status === "unpaid" ||
      s.status === "incomplete" ||
      Boolean(s.stripe_dispute_status)
  ).length;

  return {
    active_subscriptions: active.length,
    estimated_mrr_cents: active.reduce((sum, s) => sum + subscriptionMrrCents(s), 0),
    total_accounts: subscriptions.length,
    failed_payments_30d: failedPayments30d,
    at_risk_count: atRiskCount,
    tier_breakdown: [...tierMap.values()].sort((a, b) => b.mrr_cents - a.mrr_cents),
  };
}

export async function fetchAdminBillingPageData(): Promise<AdminBillingPageData> {
  const { supabase } = await requireAdmin();
  const subscriptions = await fetchAdminSubscriptions();

  const { data: ledgerRows, error } = await supabase
    .from("billing_ledger_events")
    .select(
      `
      id,
      employer_id,
      event_type,
      amount_cents,
      currency,
      plan_slug,
      subscription_status,
      occurred_at,
      stripe_invoice_id,
      profiles!billing_ledger_events_employer_id_fkey (
        company_profiles (
          company_name
        )
      )
    `
    )
    .order("occurred_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const ledger: AdminBillingLedgerRow[] = (ledgerRows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const companyProfiles = profile?.company_profiles;
    const company = Array.isArray(companyProfiles)
      ? companyProfiles[0]
      : companyProfiles;

    return {
      id: row.id,
      employer_id: row.employer_id,
      company_name: company?.company_name ?? null,
      event_type: row.event_type,
      amount_cents: row.amount_cents,
      currency: row.currency,
      plan_slug: row.plan_slug,
      subscription_status: row.subscription_status,
      occurred_at: row.occurred_at,
      stripe_invoice_id: row.stripe_invoice_id ?? null,
    };
  });

  const scheduledChanges = subscriptions.filter(
    (s) => s.scheduled_plan_slug || s.cancel_at_period_end
  ).length;

  return {
    metrics: {
      ...buildMetrics(subscriptions),
      scheduled_changes: scheduledChanges,
    },
    subscriptions,
    ledger,
  };
}

/** Admin VIP/support grant — no Stripe charge. */
export async function adminOverrideEmployerPlan(input: unknown): Promise<ActionResult> {
  try {
    const parsed = adminPlanOverrideSchema.parse(input);
    const { user } = await requireAdmin();
    const admin = await createAdminClient();

    const { data: plan, error: planError } = await admin
      .from("billing_plans")
      .select("id, slug")
      .eq("slug", parsed.planSlug)
      .maybeSingle();

    if (planError || !plan) {
      return { success: false, error: "Billing plan not found." };
    }

    const expiresAt =
      parsed.expiresInDays != null
        ? new Date(
            Date.now() + parsed.expiresInDays * 24 * 60 * 60 * 1000
          ).toISOString()
        : null;

    const { error } = await admin
      .from("employer_subscriptions")
      .update({
        override_plan_id: plan.id,
        override_expires_at: expiresAt,
        override_reason: parsed.reason,
        override_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", parsed.employerId);

    if (error) throw new Error(error.message);

    await invalidateEmployerCache(parsed.employerId);
    await logAdminAction("override_employer_plan", "employer_subscription", parsed.employerId, {
      planSlug: parsed.planSlug,
      expiresAt,
      reason: parsed.reason,
    });

    revalidatePath("/admin/billing");
    revalidatePath("/admin/billing-ops");
    return { success: true };
  } catch (err) {
    safeError("adminOverrideEmployerPlan:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to override plan",
    };
  }
}

export async function adminRevokeEmployerPlanOverride(
  input: unknown
): Promise<ActionResult> {
  try {
    const parsed = adminRevokePlanOverrideSchema.parse(input);
    await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin
      .from("employer_subscriptions")
      .update({
        override_plan_id: null,
        override_expires_at: null,
        override_reason: parsed.reason,
        override_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", parsed.employerId);

    if (error) throw new Error(error.message);

    await invalidateEmployerCache(parsed.employerId);
    await logAdminAction(
      "revoke_employer_plan_override",
      "employer_subscription",
      parsed.employerId,
      { reason: parsed.reason }
    );

    revalidatePath("/admin/billing");
    revalidatePath("/admin/billing-ops");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to revoke override",
    };
  }
}

/** Full or partial refund against a PaymentIntent (pi_) or Charge (ch_). */
export async function adminIssueStripeRefund(input: unknown): Promise<ActionResult> {
  try {
    const parsed = adminIssueRefundSchema.parse(input);
    await requireAdmin();

    const stripe = getStripe();
    if (!stripe) {
      return { success: false, error: "Stripe is not configured." };
    }

    const admin = await createAdminClient();
    const { data: sub } = await admin
      .from("employer_subscriptions")
      .select("employer_id")
      .eq("employer_id", parsed.employerId)
      .maybeSingle();

    if (!sub) {
      return { success: false, error: "Employer subscription not found." };
    }

    const ref = parsed.stripePaymentRef.trim();
    const refundParams: {
      payment_intent?: string;
      charge?: string;
      amount?: number;
      reason: "duplicate" | "fraudulent" | "requested_by_customer";
      metadata: Record<string, string>;
    } = {
      reason: parsed.reason,
      metadata: {
        employer_id: parsed.employerId,
        admin_note: parsed.note.slice(0, 400),
      },
    };

    if (ref.startsWith("pi_")) {
      refundParams.payment_intent = ref;
    } else if (ref.startsWith("ch_")) {
      refundParams.charge = ref;
    } else {
      return {
        success: false,
        error: "Provide a PaymentIntent (pi_…) or Charge (ch_…) id.",
      };
    }

    if (parsed.amountCents != null) {
      refundParams.amount = parsed.amountCents;
    }

    const refund = await stripe.refunds.create(refundParams, {
      idempotencyKey: `admin-refund/${parsed.employerId}/${ref}/${parsed.amountCents ?? "full"}`,
    });

    await recordBillingLedgerEvent({
      employerId: parsed.employerId,
      stripeEventId: `refund_${refund.id}`,
      eventType: "refund.created",
      amountCents: -(refund.amount ?? 0),
      currency: refund.currency ?? "usd",
      subscriptionStatus: refund.status ?? null,
    });

    await logAdminAction("issue_stripe_refund", "employer_subscription", parsed.employerId, {
      refundId: refund.id,
      paymentRef: ref,
      amountCents: refund.amount,
      reason: parsed.reason,
      note: parsed.note,
    });

    revalidatePath("/admin/billing");
    return { success: true };
  } catch (err) {
    safeError("adminIssueStripeRefund:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Failed to issue refund";
    return { success: false, error: message };
  }
}
