import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { recordBillingLedgerEvent } from "@/lib/server/stripe/billing-ledger";
import { syncEmployerSubscriptionFromStripe } from "@/lib/server/stripe/sync-subscription";
import {
  getInvoiceSubscriptionRef,
  getInvoiceSubscriptionId,
  getInvoiceCustomerId,
} from "@/lib/server/stripe/invoice-utils";
import { safeError, safeLog } from "@/utils/logger";

async function resolveEmployerIdFromInvoice(
  invoice: Stripe.Invoice
): Promise<string | null> {
  const metadataEmployer = invoice.metadata?.employer_id;
  if (metadataEmployer) return metadataEmployer;

  const supabase = await createAdminClient();

  const subscriptionRef = getInvoiceSubscriptionRef(invoice);
  if (subscriptionRef) {
    const subscriptionId =
      typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;

    const { data } = await supabase
      .from("employer_subscriptions")
      .select("employer_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (data?.employer_id) return data.employer_id;
  }

  // Portal / first invoice race: subscription row may not exist yet — use customer.
  const customerId = getInvoiceCustomerId(invoice);
  if (customerId) {
    const { data } = await supabase
      .from("employer_subscriptions")
      .select("employer_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (data?.employer_id) {
      safeLog(
        `[Stripe] invoice employer resolved via customer_id=${customerId}`
      );
      return data.employer_id;
    }
  }

  safeError("[Stripe] resolveEmployerIdFromInvoice: unresolved", {
    invoiceId: invoice.id,
    subscriptionRef: subscriptionRef
      ? typeof subscriptionRef === "string"
        ? subscriptionRef
        : subscriptionRef.id
      : null,
    customerId,
  });
  return null;
}

export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  stripeEventId: string
): Promise<void> {
  const employerId = await resolveEmployerIdFromInvoice(invoice);
  if (!employerId) return;

  const subscriptionId = getInvoiceSubscriptionId(invoice);

  const supabase = await createAdminClient();
  const now = new Date().toISOString();

  await supabase
    .from("employer_subscriptions")
    .update({
      last_payment_status: "paid",
      last_payment_at: now,
      last_payment_error: null,
      failed_payment_count: 0,
      updated_at: now,
    })
    .eq("employer_id", employerId);

  await recordBillingLedgerEvent({
    employerId,
    stripeEventId,
    eventType: "invoice.paid",
    amountCents: invoice.amount_paid ?? 0,
    currency: invoice.currency ?? "usd",
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
    occurredAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : now,
  });
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  stripeEventId: string,
  subscription: Stripe.Subscription | null,
  stripeEventCreated?: number
): Promise<void> {
  const employerId =
    subscription?.metadata?.employer_id ??
    (await resolveEmployerIdFromInvoice(invoice));

  if (!employerId) return;

  if (subscription) {
    const result = await syncEmployerSubscriptionFromStripe(
      subscription,
      stripeEventId,
      stripeEventCreated
    );
    if (!result.success) {
      throw new Error(result.error ?? "Past-due sync failed");
    }
  }

  const supabase = await createAdminClient();
  const { data: sub } = await supabase
    .from("employer_subscriptions")
    .select("failed_payment_count, plan_slug, status")
    .eq("employer_id", employerId)
    .maybeSingle();

  const failedCount = (sub?.failed_payment_count ?? 0) + 1;
  const now = new Date().toISOString();

  const lastError =
    invoice.last_finalization_error?.message ||
    (invoice as Stripe.Invoice & { last_payment_error?: { message?: string } })
      .last_payment_error?.message ||
    `Invoice ${invoice.id} payment failed`;

  await supabase
    .from("employer_subscriptions")
    .update({
      last_payment_status: "failed",
      last_payment_at: now,
      last_payment_error: lastError,
      failed_payment_count: failedCount,
      updated_at: now,
    })
    .eq("employer_id", employerId);

  const subscriptionId = getInvoiceSubscriptionId(invoice) ?? subscription?.id ?? null;

  await recordBillingLedgerEvent({
    employerId,
    stripeEventId,
    eventType: "invoice.payment_failed",
    amountCents: invoice.amount_due ?? 0,
    currency: invoice.currency ?? "usd",
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
    planSlug: sub?.plan_slug ?? subscription?.metadata?.plan_slug ?? null,
    subscriptionStatus: sub?.status ?? subscription?.status ?? null,
    occurredAt: now,
  });

  try {
    const { notifyEmployerSubscriptionAlert } = await import("@/actions/email");
    const amountDue = invoice.amount_due ?? 0;
    const currency = (invoice.currency ?? "usd").toUpperCase();
    const amountLabel =
      amountDue > 0
        ? `${currency} ${(amountDue / 100).toFixed(2)}`
        : null;
    await notifyEmployerSubscriptionAlert({
      employerId,
      kind: "payment_failed",
      planSlug: sub?.plan_slug ?? subscription?.metadata?.plan_slug ?? "discovery",
      amountLabel,
      idempotencyKey: `subscription-payment-failed/${invoice.id}`,
    });
  } catch (err) {
    safeError("[Billing] payment_failed email failed", err);
  }
}
