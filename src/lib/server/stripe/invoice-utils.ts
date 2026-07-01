import type Stripe from "stripe";

/** Stripe API 2024+ removed `subscription` from the Invoice type; webhooks still send it. */
export type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

export function getInvoiceSubscriptionRef(
  invoice: Stripe.Invoice
): string | Stripe.Subscription | null | undefined {
  return (invoice as StripeInvoiceWithSubscription).subscription;
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const ref = getInvoiceSubscriptionRef(invoice);
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}
