import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  FileUser,
  Calendar,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs, getRecentApplicants } from "@/actions/employer/dashboard";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { getEmployerInterviews } from "@/actions/employer/hiring";
import { getHiredData } from "@/actions/employer/hired";
import { formatFullName } from "@/lib/format/name";
import { JobCard } from "@/components/employer/JobCard";
import { RecentApplicantRow } from "@/components/employer/RecentApplicantRow";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { DashboardOnboardedBanner } from "@/components/employer/dashboard/DashboardOnboardedBanner";
import { DashboardPoller } from "@/components/employer/dashboard/DashboardPoller";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageCard } from "@/components/shared/billing/PlanUsageCard";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import {
  isActiveJobLimitReached,
} from "@/lib/entitlements/limits";
import { DashboardHiringSummary } from "@/components/employer/dashboard/DashboardHiringSummary";
import {
  EmployerPageHeader,
  EmployerPageShell,
  EmployerSectionCard,
  EmployerKpiStrip,
} from "@/components/employer/layout";
import type { EmployerKpiItem } from "@/components/employer/layout";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
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
    .select("id, first_name, middle_name, last_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/signin");
  }

  const employerName =
    formatFullName(profile.first_name, profile.middle_name, profile.last_name) ||
    "Employer";

  const [jobs, recentApplicants, planUsage, interviews, hiredData] =
    await Promise.all([
      getRecentJobs(profile.id),
      getRecentApplicants(profile.id),
      getEmployerPlanUsage(),
      getEmployerInterviews(),
      getHiredData(),
    ]);

  const messagingEnabled = planUsage?.messagingEnabled ?? false;
  const atJobLimit =
    planUsage !== null &&
    isActiveJobLimitReached(
      planUsage.activeJobsCount,
      planUsage.activeJobsLimit
    );

  const totalApplicants = jobs.reduce(
    (sum, job) => sum + (job.applicants_count ?? 0),
    0
  );

  const activeJobsValue =
    planUsage?.activeJobsLimit === null
      ? planUsage?.activeJobsCount ?? jobs.length
      : `${planUsage?.activeJobsCount ?? jobs.length} / ${planUsage?.activeJobsLimit}`;

  const activeJobsHint =
    planUsage?.activeJobsLimit === null
      ? "Unlimited on your plan"
      : planUsage
        ? `${planUsage.activeJobsLimit - planUsage.activeJobsCount} slots left`
        : undefined;

  const kpiItems: EmployerKpiItem[] = [
    {
      label: "Active jobs",
      value: activeJobsValue,
      hint: activeJobsHint,
      icon: Briefcase,
      href: "/employer/jobs",
    },
    {
      label: "Applicants",
      value: totalApplicants,
      hint: "Across all job posts",
      icon: FileUser,
      href: "/employer/jobs",
    },
    {
      label: "Interviews",
      value: interviews.length,
      hint: "Scheduled stage",
      icon: Calendar,
      href: "/employer/interviews",
    },
    {
      label: "Active hires",
      value: hiredData.stats.totalActive,
      hint: "Current contracts",
      icon: Users,
      href: "/employer/hired",
    },
  ];

  return (
    <EmployerPageShell width="wide" className="gap-6">
      <DashboardPoller />
      <EmployerPageHeader
        title={`Welcome back, ${employerName}!`}
        subhead={
          "Manage your job posts and review candidates."
        }
        actions={<PostJobCTA planUsage={planUsage} />}
      />

      <Suspense fallback={null}>
        <DashboardOnboardedBanner planUsage={planUsage} />
      </Suspense>

      <EmployerKpiStrip items={kpiItems} />

      {!messagingEnabled && totalApplicants > 0 ? (
        <ContextualUpgradeBanner
          feature="messaging"
          currentPlan={planUsage?.planSlug ?? "discovery"}
        />
      ) : null}

      {atJobLimit && planUsage ? (
        <ContextualUpgradeBanner
          feature="job_limit"
          currentPlan={planUsage.planSlug}
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your job posts
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
              View all
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applicantsPerJobLimit={planUsage?.applicantsPerJobLimit ?? null}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase size={22} />}
              description="You haven't posted any jobs yet. Create your first listing to start hiring."
              action={
                <PostJobCTA
                  planUsage={planUsage}
                  label="Post a New Job"
                  compact
                />
              }
            />
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
          <EmployerSectionCard
            title="Recent applications"
            description={
              recentApplicants.length > 0
                ? `${recentApplicants.length} latest`
                : undefined
            }
            padded={false}
            bodyClassName=""
          >
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
          </EmployerSectionCard>

          <DashboardHiringSummary
            interviewCount={interviews.length}
            activeHires={hiredData.stats.totalActive}
            upcomingInterviews={interviews}
          />

          {planUsage ? <PlanUsageCard usage={planUsage} /> : null}
        </aside>
      </div>
    </EmployerPageShell>
  );
}
