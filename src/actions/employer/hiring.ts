"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { uuidSchema } from "@/lib/validations/common";
import { updateApplicationStatus } from "@/actions/applications";

const scheduleInterviewSchema = z
  .object({ applicationId: uuidSchema })
  .strict();

export async function scheduleInterview(applicationId: string) {
  return updateApplicationStatus(applicationId, "INTERVIEW_SCHEDULED");
}

const sendOfferSchema = z
  .object({ applicationId: uuidSchema })
  .strict();

export async function sendJobOffer(applicationId: string) {
  const result = await runAction("sendJobOffer", async () => {
    const parsed = sendOfferSchema.parse({ applicationId });
    const { supabase, profile } = await requireRole("employer");

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id, status")
      .eq("id", parsed.applicationId)
      .single();

    if (appError || !application) {
      return fail("Application not found.");
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, monthly_salary, hours_per_week, employment_type")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return fail("Access denied. You do not own this job.");
    }

    const { data: existingOffer } = await supabase
      .from("contracts")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("worker_id", application.candidate_id)
      .eq("job_id", application.job_id)
      .in("status", ["offered", "active"])
      .maybeSingle();

    if (existingOffer) {
      return fail("An offer already exists for this candidate.");
    }

    const monthlyHours = Number(job.hours_per_week) * 4;
    const hourlyRate =
      monthlyHours > 0
        ? Math.round(Number(job.monthly_salary) / monthlyHours)
        : 0;

    const { error: insertError } = await supabase.from("contracts").insert({
      employer_id: profile.id,
      worker_id: application.candidate_id,
      job_id: application.job_id,
      hourly_rate: hourlyRate,
      weekly_hours: Number(job.hours_per_week),
      employment_type: job.employment_type,
      status: "offered",
    });

    if (insertError) {
      return fail("Failed to send offer.");
    }

    await supabase
      .from("applications")
      .update({ status: "HIRED" })
      .eq("id", parsed.applicationId);

    revalidatePath(`/employer/jobs/${application.job_id}/applicants`);
    revalidatePath("/employer/hired");
    revalidatePath("/employer/interviews");
    revalidatePath("/worker/contracts");
    revalidatePath("/worker/applications");

    return ok({ message: "Offer sent successfully!" });
  });

  return result.success
    ? { success: true, message: result.data?.message }
    : { error: result.error };
}

export interface EmployerInterviewRow {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  scheduledAt: string;
}

export async function getEmployerInterviews(): Promise<EmployerInterviewRow[]> {
  const { supabase, profile } = await requireRole("employer");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("employer_id", profile.id);

  const jobIds = jobs?.map((j) => j.id) ?? [];
  if (jobIds.length === 0) return [];

  const jobTitleById = new Map(jobs!.map((j) => [j.id, j.title]));

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, candidate_id, updated_at, profiles(first_name, last_name)")
    .in("job_id", jobIds)
    .eq("status", "INTERVIEW_SCHEDULED")
    .order("updated_at", { ascending: false });

  return (applications ?? []).map((app) => {
    const candidate = app.profiles as { first_name?: string; last_name?: string } | null;
    const name = candidate
      ? `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim()
      : "Candidate";

    return {
      applicationId: app.id,
      jobId: app.job_id,
      jobTitle: jobTitleById.get(app.job_id) ?? "Job",
      candidateName: name || "Candidate",
      scheduledAt: app.updated_at,
    };
  });
}

const candidateViewSchema = z
  .object({
    candidateId: uuidSchema,
    jobId: uuidSchema,
  })
  .strict();

export async function getEmployerCandidateProfile(
  candidateId: string,
  jobId: string
) {
  const parsed = candidateViewSchema.safeParse({ candidateId, jobId });
  if (!parsed.success) return null;

  const { supabase, profile } = await requireRole("employer");

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", parsed.data.jobId)
    .eq("employer_id", profile.id)
    .maybeSingle();

  if (!job) return null;

  const { data: unlock } = await supabase
    .from("unlocked_profiles")
    .select("id")
    .eq("employer_id", profile.id)
    .eq("candidate_id", parsed.data.candidateId)
    .maybeSingle();

  if (!unlock) return null;

  const { data: candidate } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, professional_title, bio, skills, experience_years, avatar_url, email, is_verified, resume_url"
    )
    .eq("id", parsed.data.candidateId)
    .maybeSingle();

  if (!candidate) return null;

  return {
    jobTitle: job.title,
    jobId: job.id,
    candidate: {
      id: candidate.id,
      name: `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim(),
      title: candidate.professional_title ?? "Professional",
      bio: candidate.bio,
      skills: (candidate.skills as string[]) ?? [],
      experienceYears: candidate.experience_years ?? 0,
      avatarUrl: candidate.avatar_url,
      email: candidate.email,
      isVerified: Boolean(candidate.is_verified),
      resumeUrl: candidate.resume_url,
    },
  };
}
