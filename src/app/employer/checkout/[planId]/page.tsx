import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createStripeCheckoutSession } from "@/actions/employer/stripe";
import { getPlanDetails } from "@/actions/employer/pricing";
import { getAccountSettings } from "@/actions/employer/billing";
import { EmployerCheckoutClient } from "@/components/employer/checkout/EmployerCheckoutClient";
import {
  EmployerPageShell,
  EmployerPageHeader,
} from "@/components/employer/layout";
import {
  isHigherTier,
  isLowerTier,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";

interface CheckoutPageProps {
  params: Promise<{ planId: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { planId } = await params;
  const plan = await getPlanDetails(planId);
  return {
    title: `Checkout - ${plan?.name || "Upgrade Plan"} | ReplaceMe`,
    description: "Complete your subscription upgrade securely via Stripe.",
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { planId } = await params;
  const targetPlan = normalizePlanSlug(planId);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  if (targetPlan === "discovery") {
    redirect("/employer/pricing");
  }

  const accountSettings = await getAccountSettings();
  const currentPlanSlug = normalizePlanSlug(accountSettings?.plan ?? "discovery");

  if (!isHigherTier(targetPlan, currentPlanSlug)) {
    if (isLowerTier(targetPlan, currentPlanSlug)) {
      redirect("/employer/settings/account");
    }
    redirect("/employer/settings/account");
  }

  const [plan, checkout] = await Promise.all([
    getPlanDetails(planId),
    createStripeCheckoutSession(planId),
  ]);

  if (!plan) {
    redirect("/employer/pricing");
  }

  if (checkout.error) {
    redirect(
      `/employer/pricing?checkout=error&message=${encodeURIComponent(
        checkout.error
      )}`
    );
  }

  // Existing subscriber: plan changed in place (upgrade) or scheduled (downgrade).
  if (checkout.upgraded || checkout.downgradeScheduled) {
    const flag = checkout.downgradeScheduled ? "downgraded=1" : "upgraded=1";
    redirect(
      `/employer/settings/account?checkout=success&${flag}&plan=${encodeURIComponent(
        checkout.planSlug ?? targetPlan
      )}`
    );
  }

  if (!checkout.checkoutUrl) {
    redirect(
      `/employer/pricing?checkout=error&message=${encodeURIComponent(
        "Checkout unavailable"
      )}`
    );
  }

  return (
    <EmployerPageShell width="content" className="gap-8">
      <EmployerPageHeader
        title={`Upgrade to ${plan.name}`}
        subhead="Review your order and continue to secure Stripe checkout."
        bordered={false}
      />
      <EmployerCheckoutClient plan={plan} checkoutUrl={checkout.checkoutUrl} />
    </EmployerPageShell>
  );
}
