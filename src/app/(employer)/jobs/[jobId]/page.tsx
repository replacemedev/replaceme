import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobById } from "@/actions/employer/jobs";

// Presentation Components
import { JobHeader } from "@/components/employer/jobs/view/JobHeader";
import { JobDescriptionCard } from "@/components/employer/jobs/view/JobDescriptionCard";
import { PerformanceMetricsCard } from "@/components/employer/jobs/view/PerformanceMetricsCard";
import { CompensationCard } from "@/components/employer/jobs/view/CompensationCard";
import { HiringTeamCard } from "@/components/employer/jobs/view/HiringTeamCard";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobListingViewPage({ params }: PageProps) {
  const { jobId } = await params;
  
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  // Fetch job securely with ownership verification (IDOR protection)
  const job = await getJobById(jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-margin-desktop py-12 space-y-8">
      {/* Top Header Section */}
      <JobHeader
        jobId={job.id}
        title={job.title}
        status={job.status}
        location={job.location}
        employmentType={job.employmentType}
        monthlySalary={job.monthlySalary}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Description & Requirements */}
        <div className="lg:col-span-2">
          <JobDescriptionCard
            description={job.description}
            keyResponsibilities={job.keyResponsibilities}
            requiredSkills={job.requiredSkills}
            experienceAndEducation={job.experienceAndEducation}
          />
        </div>

        {/* Right Column: Performance, Compensation & Team */}
        <div className="lg:col-span-1 space-y-8">
          <PerformanceMetricsCard jobId={job.id} performance={job.performance} />
          <CompensationCard monthlySalary={job.monthlySalary} hoursPerWeek={job.hoursPerWeek} />
          <HiringTeamCard hiringTeam={job.hiringTeam} />
        </div>
      </div>
    </div>
  );
}
