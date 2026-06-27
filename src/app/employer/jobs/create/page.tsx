import React from "react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getEmploymentTypes,
  getSkills,
  getJobForEdit,
} from "@/actions/employer/jobs";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { CreateJobForm } from "./CreateJobForm";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { isActiveJobLimitReached } from "@/lib/entitlements/limits";

export const metadata = {
  title: "Create a Job Post | ReplaceMe",
  description:
    "Create a new remote job post on ReplaceMe and hire specialized talent.",
};

export default async function CreateJobPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const editJobId = params.edit?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const [employmentTypes, skillsOptions, editJob, planUsage] = await Promise.all([
    getEmploymentTypes(),
    getSkills(),
    editJobId ? getJobForEdit(editJobId) : Promise.resolve(null),
    getEmployerPlanUsage(),
  ]);

  if (editJobId && !editJob) {
    notFound();
  }

  const atJobLimit =
    !editJob &&
    planUsage !== null &&
    isActiveJobLimitReached(
      planUsage.activeJobsCount,
      planUsage.activeJobsLimit
    );

  return (
    <div className="max-w-4xl mx-auto px-margin-desktop py-12 space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
          {editJob ? "Edit Job Post" : "Create a Job Post"}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          {editJob
            ? "Update your listing details. Changes apply immediately to active jobs."
            : "Fill out the details below to list your open position and match with verified remote talent."}
        </p>
      </div>

      {planUsage && !editJob ? <PlanUsageStrip usage={planUsage} /> : null}

      {atJobLimit && planUsage ? (
        <UnlockOverlay feature="job_limit" currentPlan={planUsage.planSlug} />
      ) : (
        <CreateJobForm
          employmentTypes={employmentTypes}
          skillsOptions={skillsOptions}
          editJob={editJob}
        />
      )}
    </div>
  );
}
