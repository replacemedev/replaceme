import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIndustries, getCompanyProfile } from "@/actions/employer/company";
import { CompanyProfileForm } from "./CompanyProfileForm";

export const metadata = {
  title: "Company Profile Settings | ReplaceMe",
  description: "Build your brand presence to attract top remote talent.",
};

export default async function CompanySettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify employer role in database
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  // Load backend stubs
  const industries = await getIndustries();
  const initialData = await getCompanyProfile();

  return (
    <div className="max-w-4xl mx-auto px-margin-desktop py-12">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Company Profile</h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          Build your brand presence to attract top talent. This information will be visible on your job postings.
        </p>
      </div>

      {/* Render Client Form Wrapper */}
      <CompanyProfileForm initialData={initialData} industries={industries} />
    </div>
  );
}
