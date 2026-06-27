import { getSiteUrl } from "@/lib/auth/site-url";
import { requireStripe } from "@/lib/server/stripe/client";
import { ensureStripeCustomer } from "@/lib/server/stripe/ensure-customer";

type CreatePortalInput = {
  employerId: string;
  email: string;
  name: string;
};

export async function createBillingPortalSession(
  input: CreatePortalInput
): Promise<{ portalUrl: string } | { error: string }> {
  const customerResult = await ensureStripeCustomer({
    employerId: input.employerId,
    email: input.email,
    name: input.name,
  });

  if ("error" in customerResult) {
    return { error: customerResult.error };
  }

  const stripe = requireStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerResult.customerId,
    return_url: `${siteUrl}/employer/settings/account`,
  });

  return { portalUrl: session.url };
}
