import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountSettings, getEmployerPlanUsage } from "@/actions/employer/billing";
import { getEmployerAccountDetails } from "@/actions/employer/account";
import { AccountSettingsClient } from "./AccountSettingsClient";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = {
  title: "Account Settings | ReplaceMe",
  description: "Manage your profile, security, and subscription plan.",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const [initialSettings, planUsage, accountDetails] = await Promise.all([
    getAccountSettings(),
    getEmployerPlanUsage(),
    getEmployerAccountDetails(),
  ]);

  const defaultSettings = initialSettings || {
    plan: "discovery" as const,
    unlocksUsed: 0,
    unlocksTotal: 0,
    active: false,
    nextBillingDate: null,
    status: "Inactive",
    cancelAtPeriodEnd: false,
    hasStripeSubscription: false,
  };

  return (
    <EmployerPageShell width="wide" className="gap-8">
      <EmployerPageHeader
        title="Account settings"
        subhead="Manage your profile, security, and subscription plan."
      />

      <Suspense fallback={null}>
        <AccountSettingsClient
          initialSettings={defaultSettings}
          planUsage={planUsage}
          accountDetails={accountDetails}
        />
      </Suspense>
    </EmployerPageShell>
  );
}
