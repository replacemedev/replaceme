import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountSettings, getEmployerPlanUsage } from "@/actions/employer/billing";
import { AccountSettingsClient } from "./AccountSettingsClient";

export const metadata = {
  title: "Account Settings | ReplaceMe",
  description: "Manage your profile, security, and subscription plan.",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const [initialSettings, planUsage] = await Promise.all([
    getAccountSettings(),
    getEmployerPlanUsage(),
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
    <div className="max-w-6xl mx-auto px-margin-desktop py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
        <span>My Account</span>
        <span>&rsaquo;</span>
        <span className="text-slate-500">Account Settings</span>
      </div>

      {/* Page Title & Subtitle */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          Manage your profile, security, and subscription plan.
        </p>
      </div>

      {/* Main Interactive Client Grid */}
      <Suspense fallback={null}>
        <AccountSettingsClient
          initialSettings={defaultSettings}
          planUsage={planUsage}
        />
      </Suspense>
    </div>
  );
}
