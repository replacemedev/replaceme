"use server";

import { requireAdmin } from "@/lib/server/auth/require-admin";
import { monthlyMrrCents } from "@/lib/server/stripe/subscription-price";
import { fetchAdminSubscriptions } from "@/actions/admin-actions";
import type {
  AdminBillingLedgerRow,
  AdminBillingMetrics,
  AdminBillingPageData,
  AdminBillingTierBreakdown,
  AdminSubscriptionRow,
} from "@/types/admin.types";

const TIER_LABELS: Record<string, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

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

  return {
    active_subscriptions: active.length,
    estimated_mrr_cents: active.reduce((sum, s) => sum + subscriptionMrrCents(s), 0),
    total_accounts: subscriptions.length,
    failed_payments_30d: failedPayments30d,
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
    };
  });

  return {
    metrics: buildMetrics(subscriptions),
    subscriptions,
    ledger,
  };
}
