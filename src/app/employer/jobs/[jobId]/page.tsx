import React from "react";
import { notFound, redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getJobById } from "@/actions/employer/jobs";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { JobHeader } from "@/components/employer/jobs/view/JobHeader";
import { JobDescriptionCard } from "@/components/employer/jobs/view/JobDescriptionCard";
import { PerformanceMetricsCard } from "@/components/employer/jobs/view/PerformanceMetricsCard";
import { CompensationCard } from "@/components/employer/jobs/view/CompensationCard";
import { HiringTeamCard } from "@/components/employer/jobs/view/HiringTeamCard";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { EmployerPageShell } from "@/components/employer/layout";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobListingViewPage({ params }: PageProps) {
  const { jobId } = await params;

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

  const [job, planUsage] = await Promise.all([
    getJobById(jobId),
    getEmployerPlanUsage(),
  ]);

  if (!job) {
    notFound();
  }

  const planSlug = planUsage?.planSlug ?? "discovery";
  const isPendingReview = job.status === "Pending Review";

  return (
    <EmployerPageShell width="content" className="gap-8">
      <JobHeader
        jobId={job.id}
        title={job.title}
        status={job.status}
        location={job.location}
        employmentType={job.employmentType}
        monthlySalary={job.monthlySalary}
      />

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {isPendingReview ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Awaiting manual review (~2 business days)
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800/90">
                Discovery listings go through a short approval queue before going
                live. Paid plans get instant approval, full profiles, and
                messaging.
              </p>
            </div>
          </div>
          <UpgradeCTA
            feature="identity"
            currentPlan={planSlug}
            variant="secondary"
            label="Skip the queue — upgrade"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <JobDescriptionCard
            description={job.description}
            keyResponsibilities={job.keyResponsibilities}
            requiredSkills={job.requiredSkills}
            experienceAndEducation={job.experienceAndEducation}
          />
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
          <PerformanceMetricsCard
            jobId={job.id}
            performance={job.performance}
            planSlug={planSlug}
            applicantsPerJobLimit={planUsage?.applicantsPerJobLimit ?? null}
          />
          <CompensationCard
            monthlySalary={job.monthlySalary}
            hoursPerWeek={job.hoursPerWeek}
          />
          <HiringTeamCard hiringTeam={job.hiringTeam} />
        </div>
      </div>
    </EmployerPageShell>
  );
}
