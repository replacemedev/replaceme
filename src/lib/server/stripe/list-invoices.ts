import type Stripe from "stripe";
import { requireStripe } from "@/lib/server/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export type EmployerInvoiceRow = {
  id: string;
  number: string | null;
  created: number;
  status: string | null;
  description: string;
  amountPaid: number;
  currency: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

function invoiceDescription(invoice: Stripe.Invoice): string {
  const lines = invoice.lines?.data ?? [];
  const first = lines.find((l) => l.description)?.description;
  if (first) return first;
  if (invoice.description) return invoice.description;
  if (invoice.billing_reason === "subscription_create") return "Subscription start";
  if (invoice.billing_reason === "subscription_cycle") return "Subscription renewal";
  if (invoice.billing_reason === "subscription_update") return "Plan change";
  return "Invoice";
}

/**
 * List Stripe invoices for an employer customer.
 * @see https://docs.stripe.com/api/invoices/list
 */
export async function listInvoicesForCustomer(
  customerId: string,
  limit = 24
): Promise<EmployerInvoiceRow[]> {
  const stripe = requireStripe();
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    created: inv.created,
    status: inv.status,
    description: invoiceDescription(inv),
    amountPaid: inv.amount_paid ?? inv.amount_due ?? 0,
    currency: (inv.currency ?? "usd").toUpperCase(),
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
  }));
}

export async function listInvoicesForEmployer(
  employerId: string
): Promise<{ invoices: EmployerInvoiceRow[] } | { error: string }> {
  const supabase = await createAdminClient();
  const { data: row, error } = await supabase
    .from("employer_subscriptions")
    .select("stripe_customer_id")
    .eq("employer_id", employerId)
    .maybeSingle();

  if (error) {
    safeError("[Billing] listInvoicesForEmployer load failed", error);
    return { error: "Could not load billing account." };
  }

  const customerId = row?.stripe_customer_id?.trim();
  if (!customerId) {
    return { invoices: [] };
  }

  try {
    const invoices = await listInvoicesForCustomer(customerId);
    return { invoices };
  } catch (err) {
    safeError("[Billing] stripe.invoices.list failed", err);
    return { error: "Could not load invoices from Stripe." };
  }
}
