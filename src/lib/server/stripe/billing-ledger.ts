import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export type BillingLedgerInput = {
  employerId: string;
  stripeEventId: string;
  eventType: string;
  amountCents?: number;
  currency?: string;
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  planSlug?: string | null;
  subscriptionStatus?: string | null;
  occurredAt?: string;
};

export async function recordBillingLedgerEvent(
  input: BillingLedgerInput
): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("billing_ledger_events").insert({
    employer_id: input.employerId,
    stripe_event_id: input.stripeEventId,
    event_type: input.eventType,
    amount_cents: input.amountCents ?? 0,
    currency: input.currency ?? "usd",
    stripe_invoice_id: input.stripeInvoiceId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    plan_slug: input.planSlug ?? null,
    subscription_status: input.subscriptionStatus ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
  });

  if (error?.code === "23505") return;

  if (error) {
    safeError("recordBillingLedgerEvent:", error);
  }
}
