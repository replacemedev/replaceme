import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIndustries, getCompanyProfile } from "@/actions/employer/company";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { CompanyProfileForm } from "./CompanyProfileForm";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = {
  title: "Company Account Settings | ReplaceMe",
  description: "Build your brand presence to attract top remote talent.",
};

export default async function CompanySettingsPage() {
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

  const [industries, initialData, planUsage] = await Promise.all([
    getIndustries(),
    getCompanyProfile(),
    getEmployerPlanUsage(),
  ]);

  const isProfileComplete = Boolean(
    initialData?.companyName?.trim() &&
      initialData?.industry?.trim() &&
      initialData?.companyBio?.trim()
  );

  return (
    <EmployerPageShell width="wide" className="gap-8">
      <EmployerPageHeader
        title="Company profile"
        subhead="Build your brand presence to attract top talent. This information is visible on your job postings."
      />

      <CompanyProfileForm
        initialData={initialData}
        industries={industries}
        isProfileComplete={isProfileComplete}
        planUsage={planUsage}
      />
    </EmployerPageShell>
  );
}
