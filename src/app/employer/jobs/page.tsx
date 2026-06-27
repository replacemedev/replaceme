import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs } from "@/actions/employer/dashboard";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { JobCard } from "@/components/employer/JobCard";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import {
  hasPriorityListing,
  isActiveJobLimitReached,
} from "@/lib/entitlements/limits";

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
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/login");
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
  const showPriority = planUsage
    ? hasPriorityListing(planUsage.planSlug)
    : false;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Your Job Posts
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
            {planUsage
              ? planUsage.activeJobsLimit === null
                ? `${planUsage.activeJobsCount} active listings on your plan.`
                : `${planUsage.activeJobsCount} of ${planUsage.activeJobsLimit} active job slots used.`
              : "View and manage every listing you have published."}
          </p>
        </div>
        <PostJobCTA planUsage={planUsage} />
      </div>

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {atJobLimit && planUsage ? (
        <ContextualUpgradeBanner
          feature="job_limit"
          currentPlan={planUsage.planSlug}
        />
      ) : null}

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showPriorityBadge={showPriority}
              applicantsPerJobLimit={planUsage?.applicantsPerJobLimit ?? null}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase size={22} />}
          description="You haven't posted any jobs yet. Create your first listing to start hiring."
          actionLabel="Post a New Job"
          actionHref="/employer/jobs/create"
        />
      )}
    </div>
  );
}
