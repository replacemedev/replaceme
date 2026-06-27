import { createAdminClient } from "@/lib/supabase/server";
import { requireStripe } from "@/lib/server/stripe/client";
import { safeError } from "@/utils/logger";

type EnsureCustomerInput = {
  employerId: string;
  email: string;
  name: string;
};

export async function ensureStripeCustomer(
  input: EnsureCustomerInput
): Promise<{ customerId: string } | { error: string }> {
  const stripe = requireStripe();
  const supabase = await createAdminClient();

  const { data: sub } = await supabase
    .from("employer_subscriptions")
    .select("stripe_customer_id")
    .eq("employer_id", input.employerId)
    .maybeSingle();

  if (sub?.stripe_customer_id) {
    return { customerId: sub.stripe_customer_id };
  }

  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name,
    metadata: { employer_id: input.employerId },
  });

  const { error: upsertError } = await supabase.from("employer_subscriptions").upsert(
    {
      employer_id: input.employerId,
      stripe_customer_id: customer.id,
      status: "inactive",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id" }
  );

  if (upsertError) {
    safeError("ensureStripeCustomer: failed to persist customer id", upsertError);
    return { error: "Failed to save billing customer." };
  }

  return { customerId: customer.id };
}
