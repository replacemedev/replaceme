import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, FileUser } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs, getRecentApplicants } from "@/actions/employer/dashboard";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { JobCard } from "@/components/employer/JobCard";
import { RecentApplicantRow } from "@/components/employer/RecentApplicantRow";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageCard } from "@/components/shared/billing/PlanUsageCard";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { planDashboardSubhead } from "@/lib/entitlements/ui-copy";
import {
  hasPriorityListing,
  isActiveJobLimitReached,
} from "@/lib/entitlements/limits";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
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
    .select("id, first_name, last_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/login");
  }

  const employerName = profile.first_name
    ? profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name
    : "Employer";

  const [jobs, recentApplicants, planUsage] = await Promise.all([
    getRecentJobs(profile.id),
    getRecentApplicants(profile.id),
    getEmployerPlanUsage(),
  ]);

  const messagingEnabled = planUsage?.messagingEnabled ?? false;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Welcome back, {employerName}!
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed max-w-2xl">
            {planUsage
              ? planDashboardSubhead(
                  planUsage.planSlug,
                  planUsage.activeJobsCount,
                  planUsage.activeJobsLimit,
                  planUsage.identityMode
                )
              : "Manage your job posts and review candidates who applied to work with you."}
          </p>
        </div>
        <PostJobCTA planUsage={planUsage} />
      </div>

      {atJobLimit && planUsage ? (
        <ContextualUpgradeBanner
          feature="job_limit"
          currentPlan={planUsage.planSlug}
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Job Posts
              </h2>
              {jobs.length > 0 ? (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-extrabold text-white bg-red-500 rounded-full select-none">
                  {jobs.length}
                </span>
              ) : null}
            </div>
            <Link
              href="/employer/jobs"
              className="text-sm font-semibold text-[#006e2f] hover:text-[#005321] hover:underline transition-colors"
            >
              View All
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
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

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
          {planUsage ? <PlanUsageCard usage={planUsage} /> : null}

          <section className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileUser className="h-5 w-5 text-[#006e2f]" aria-hidden />
                <h2 className="text-base font-bold text-slate-900">
                  Job Applications
                </h2>
              </div>
              {recentApplicants.length > 0 ? (
                <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                  {recentApplicants.length} recent
                </span>
              ) : null}
            </div>

            {recentApplicants.length > 0 ? (
              <ul className="divide-y divide-slate-100 max-h-[min(50vh,480px)] overflow-y-auto">
                {recentApplicants.map((applicant) => (
                  <li key={applicant.id} className="p-3">
                    <RecentApplicantRow
                      applicant={applicant}
                      messagingEnabled={messagingEnabled}
                      compact
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={<FileUser size={22} />}
                  description="Applications from candidates who want to work on your jobs will appear here."
                  actionLabel="View job posts"
                  actionHref="/employer/jobs"
                />
              </div>
            )}
          </section>

          <nav
            className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600"
            aria-label="Hiring resources"
          >
            <Link
              href="/help/hiring-guide"
              className="hover:text-[#006e2f] transition-colors"
            >
              Hiring guide
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link
              href="/employer/messages"
              className="hover:text-[#006e2f] transition-colors"
            >
              Messages
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link
              href="/employer/hired"
              className="hover:text-[#006e2f] transition-colors"
            >
              Hired team
            </Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
