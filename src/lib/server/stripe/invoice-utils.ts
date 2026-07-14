import type Stripe from "stripe";

/** Stripe API variants: root `subscription` (legacy) vs `parent.subscription_details`. */
export type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  parent?: {
    type?: string | null;
    subscription_details?: {
      subscription?: string | Stripe.Subscription | null;
    } | null;
  } | null;
};

/**
 * Resolve the Subscription linked to an Invoice across Stripe API shapes.
 * Silent null here caused `invoice.paid` to skip sync after Portal upgrades.
 */
export function getInvoiceSubscriptionRef(
  invoice: Stripe.Invoice
): string | Stripe.Subscription | null | undefined {
  const inv = invoice as StripeInvoiceWithSubscription;

  if (inv.subscription) return inv.subscription;

  const nested = inv.parent?.subscription_details?.subscription;
  if (nested) return nested;

  // Some webhook payloads nest under lines[0].subscription
  const lineSub = (
    invoice.lines?.data?.[0] as { subscription?: string | null } | undefined
  )?.subscription;
  if (lineSub) return lineSub;

  return null;
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const ref = getInvoiceSubscriptionRef(invoice);
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

export function getInvoiceCustomerId(invoice: Stripe.Invoice): string | null {
  const c = invoice.customer;
  if (!c) return null;
  return typeof c === "string" ? c : c.id;
}
