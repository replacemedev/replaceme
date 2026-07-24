import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAccountSettings,
  getEmployerPlanUsage,
  listEmployerInvoices,
} from "@/actions/employer/billing";
import { getEmployerAccountDetails } from "@/actions/employer/account";
import { getEmailVerificationStatus } from "@/actions/auth";
import { AccountSettingsClient } from "./AccountSettingsClient";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";
import { EmailVerificationBanner } from "@/components/shared/settings/EmailVerificationBanner";

export const metadata = {
  title: "Account Settings | Replaceme",
  description: "Manage your profile, security, and subscription plan.",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  const [{ data: profile }, verification] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    getEmailVerificationStatus(),
  ]);

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const [initialSettings, planUsage, accountDetails, invoiceResult] =
    await Promise.all([
      getAccountSettings(),
      getEmployerPlanUsage(),
      getEmployerAccountDetails(),
      listEmployerInvoices(),
    ]);

  const defaultSettings = initialSettings || {
    plan: "discovery" as const,
    unlocksUsed: 0,
    unlocksTotal: 0,
    active: false,
    nextBillingDate: null,
    status: "Inactive",
    statusRaw: "inactive",
    cancelAtPeriodEnd: false,
    hasStripeSubscription: false,
    lastPaymentError: null,
    scheduledPlan: null,
    scheduledEffectiveAt: null,
  };

  return (
    <EmployerPageShell width="wide" className="gap-8">
      <EmployerPageHeader
        title="Account settings"
        subhead="Manage your profile, security, subscription, and invoices."
      />

      <EmailVerificationBanner
        email={verification.email}
        needsVerification={verification.needsVerification}
      />

      <Suspense fallback={null}>
        <AccountSettingsClient
          initialSettings={defaultSettings}
          planUsage={planUsage}
          accountDetails={accountDetails}
          invoices={
            "invoices" in invoiceResult
              ? [...(invoiceResult.invoices ?? [])]
              : []
          }
          invoicesError={"error" in invoiceResult ? invoiceResult.error : null}
        />
      </Suspense>
    </EmployerPageShell>
  );
}
