import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicants } from "@/actions/employer/applicants";
import { getJobById } from "@/actions/employer/jobs";
import { ApplicantsClient } from "@/components/employer/applicants/ApplicantsClient";

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
    redirect("/login");
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
  const [job, applicantsData] = await Promise.all([
    getJobById(jobId),
    getApplicants(jobId),
  ]);

  // If job is not found or is owned by someone else, getJobById will return null
  if (!job) {
    // Check if checking for mock/fallbacks
    const mockJobIds = ["senior-react-dev-id", "junior-web-dev-id", "mock-job-id"];
    if (!mockJobIds.includes(jobId)) {
      redirect("/jobs");
    }
  }

  const jobTitle = job?.title || (jobId === "senior-react-dev-id" ? "Senior React Developer" : "Job Post");
  const applicants = applicantsData.applicants;
  const creditsBalance = applicantsData.creditsBalance;

  return (
    <div className="max-w-6xl mx-auto px-margin-desktop py-12">
      <ApplicantsClient
        initialApplicants={applicants}
        initialCreditsBalance={creditsBalance}
        jobId={jobId}
        jobTitle={jobTitle}
      />
    </div>
  );
}
