import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs } from "@/actions/employer/dashboard";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { JobsListClient } from "@/components/employer/jobs/JobsListClient";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import {
  isActiveJobLimitReached,
} from "@/lib/entitlements/limits";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = {
  title: "Job Posts | ReplaceMe",
  description: "View and manage all your employer job listings.",
};

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
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
    redirect("/signin");
  }

  const [jobs, planUsage] = await Promise.all([
    getRecentJobs(profile.id),
    getEmployerPlanUsage(),
  ]);

  const atJobLimit =
    planUsage !== null &&
    isActiveJobLimitReached(
      planUsage.activeJobsCount,
      planUsage.activeJobsLimit
    );

  return (
    <EmployerPageShell width="wide">
      <EmployerPageHeader
        title="Your job posts"
        subhead={
          planUsage
            ? planUsage.activeJobsLimit === null
              ? `${planUsage.activeJobsCount} active listings on your plan.`
              : `${planUsage.activeJobsCount} of ${planUsage.activeJobsLimit} active job slots used.`
            : "View and manage every listing you have published."
        }
        actions={<PostJobCTA planUsage={planUsage} />}
      />

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {atJobLimit && planUsage ? (
        <ContextualUpgradeBanner
          feature="job_limit"
          currentPlan={planUsage.planSlug}
        />
      ) : null}

      <JobsListClient
        jobs={jobs}
        planUsage={planUsage}
        applicantsPerJobLimit={planUsage?.applicantsPerJobLimit ?? null}
      />
    </EmployerPageShell>
  );
}
