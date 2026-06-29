import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicants } from "@/actions/employer/applicants";
import { getJobById } from "@/actions/employer/jobs";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { ApplicantsClient } from "@/components/employer/applicants/ApplicantsClient";
import { EmployerPageShell } from "@/components/employer/layout";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { jobId } = await params;
  const job = await getJobById(jobId);
  return {
    title: `Applicants - ${job?.title || "Job Post"} | ReplaceMe`,
    description: "Shortlist, review match ratings, and manage candidate workflows.",
  };
}

export default async function ApplicantsPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/signin");
  }

  // Verify role is employer
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const { jobId } = await params;

  // Parallel fetch: Job Details (for metadata/title) and Applicants
  const [job, applicantsData, planUsage] = await Promise.all([
    getJobById(jobId),
    getApplicants(jobId),
    getEmployerPlanUsage(),
  ]);

  if (!job) {
    redirect("/employer/jobs");
  }

  const jobTitle = job.title;
  const applicants = applicantsData.applicants;
  const identityMode = applicantsData.identityMode;

  return (
    <EmployerPageShell width="content">
      <ApplicantsClient
        initialApplicants={applicants}
        identityMode={identityMode}
        jobId={jobId}
        jobTitle={jobTitle}
        planUsage={planUsage}
        messagingEnabled={applicantsData.messagingEnabled}
        resumeDownloadEnabled={applicantsData.resumeDownloadEnabled}
        applicantsPerJobLimit={applicantsData.applicantsPerJobLimit}
      />
    </EmployerPageShell>
  );
}
