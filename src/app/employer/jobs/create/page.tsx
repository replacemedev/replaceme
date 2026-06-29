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
import { JobCreateStepIndicator } from "@/components/employer/jobs/create/JobCreateStepIndicator";
import { isActiveJobLimitReached } from "@/lib/entitlements/limits";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

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
    <EmployerPageShell width="wide" className="gap-8">
      <EmployerPageHeader
        title={editJob ? "Edit job post" : "Create a job post"}
        subhead={
          editJob
            ? "Update your listing details. Changes apply immediately to active jobs."
            : "Fill out each section below to list your open position and match with verified remote talent."
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          {planUsage && !editJob ? (
            <div className="lg:hidden">
              <PlanUsageStrip usage={planUsage} />
            </div>
          ) : null}

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

        <aside className="space-y-4 lg:sticky lg:top-28">
          {planUsage && !editJob ? (
            <div className="hidden lg:block">
              <PlanUsageStrip usage={planUsage} />
            </div>
          ) : null}
          <JobCreateStepIndicator isEditMode={Boolean(editJob)} />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
