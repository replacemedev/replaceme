"use server";

import { z } from "zod";
import { formatFullName } from "@/lib/format/name";
import { requireRole } from "@/lib/server/auth/session";
import { uuidSchema } from "@/lib/validations/common";
import {
  assertEmployerFullIdentity,
  assertEmployerResumeDownload,
  fetchApplicantPreview,
  fetchEmployerEntitlements,
  type BillingIdentityMode,
} from "@/lib/server/entitlements";

const candidateViewSchema = z
  .object({
    candidateId: uuidSchema,
    jobId: uuidSchema,
  })
  .strict();

type WorkerSkillPreview = {
  id?: string;
  skill_name?: string;
  proficiency_label?: string;
};

type JobExperiencePreview = {
  id?: string;
  company_name?: string;
  role_title?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string;
  skills_used?: string[];
};

function asWorkerSkills(value: unknown): WorkerSkillPreview[] {
  return Array.isArray(value) ? (value as WorkerSkillPreview[]) : [];
}

function asJobExperiences(value: unknown): JobExperiencePreview[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const row = raw as JobExperiencePreview;
    return {
      id: row.id,
      company_name: row.company_name?.trim() || "Previous role",
      role_title: row.role_title?.trim() || "Contributor",
      start_date: row.start_date,
      end_date: row.end_date ?? null,
      description: row.description,
      skills_used: Array.isArray(row.skills_used) ? row.skills_used : [],
    };
  });
}

function asSpokenLanguages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((lang) => (typeof lang === "string" ? lang.trim() : ""))
    .filter(Boolean);
}

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

  const { data: application } = await supabase
    .from("applications")
    .select("id, cover_letter, contact_methods")
    .eq("job_id", parsed.data.jobId)
    .eq("candidate_id", parsed.data.candidateId)
    .eq("is_within_plan_cap", true)
    .maybeSingle();

  if (!application) return null;

  const [entitlements, preview] = await Promise.all([
    fetchEmployerEntitlements(profile.id, supabase),
    fetchApplicantPreview(supabase, application.id, profile.id),
  ]);

  const { data: pinRow } = await supabase
    .from("pinned_workers")
    .select("worker_id")
    .eq("employer_id", profile.id)
    .eq("worker_id", parsed.data.candidateId)
    .maybeSingle();

  const isPinned = Boolean(pinRow);
  const messagingEnabled = entitlements?.messagingEnabled ?? false;

  const { data: threadRow } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("job_id", parsed.data.jobId)
    .eq("worker_id", parsed.data.candidateId)
    .maybeSingle();

  const messagingThreadId = threadRow?.id ?? null;

  if (!preview) {
    return null;
  }

  const identityMode: BillingIdentityMode =
    entitlements?.identityMode ?? preview.identity_mode;
  const planSlug = entitlements?.planSlug ?? "discovery";
  const resumeDownloadEnabled = entitlements?.resumeDownloadEnabled ?? false;
  const candidate = preview.candidate;
  const skills = Array.isArray(candidate.skills)
    ? (candidate.skills as string[])
    : [];

  const finalIdentityMode =
    identityMode === "full" && preview.identity_mode === "full"
      ? "full"
      : "anonymous_preview";
  const resumeCheck = await assertEmployerResumeDownload(profile.id);
  const workerSkills = asWorkerSkills(candidate.worker_skills);
  const jobExperiences = asJobExperiences(candidate.job_experiences);
  const spokenLanguages = asSpokenLanguages(candidate.spoken_languages);
  const showHourly = planSlug !== "discovery";

  return {
    jobTitle: job.title,
    jobId: job.id,
    identityMode: finalIdentityMode as "full" | "anonymous_preview",
    planSlug,
    resumeDownloadEnabled,
    messagingEnabled,
    isPinned,
    messagingThreadId,
    coverLetter: (application?.cover_letter as string | null) ?? null,
    contactMethods: Array.isArray(application?.contact_methods)
      ? (application.contact_methods as Array<{ type: string; value: string }>)
      : null,
    candidate: {
      id: String(candidate.id ?? parsed.data.candidateId),
      name: formatFullName(
        candidate.first_name as string | null,
        (candidate.middle_name as string | null) ?? null,
        candidate.last_name as string | null,
        (candidate.suffix as string | null) ?? null
      ),
      title: String(candidate.professional_title ?? "Professional"),
      bio: (candidate.bio as string | null) ?? null,
      skills,
      workerSkills,
      jobExperiences,
      spokenLanguages,
      experienceYears: Number(candidate.experience_years ?? 0),
      avatarUrl: (candidate.avatar_url as string | null) ?? null,
      email: (candidate.email as string | null) ?? null,
      isVerified: Boolean(candidate.is_verified),
      resumeUrl: resumeCheck.allowed
        ? ((candidate.resume_url as string | null) ?? null)
        : null,
      cvUrl: resumeCheck.allowed
        ? ((candidate.cv_url as string | null) ?? null)
        : null,
      location: (candidate.location as string | null) ?? null,
      portfolioUrl: (candidate.portfolio_url as string | null) ?? null,
      expectedSalaryMin:
        candidate.expected_salary_min === null ||
        candidate.expected_salary_min === undefined
          ? null
          : Number(candidate.expected_salary_min),
      expectedSalaryMax:
        candidate.expected_salary_max === null ||
        candidate.expected_salary_max === undefined
          ? null
          : Number(candidate.expected_salary_max),
      salaryCurrency: (candidate.salary_currency as string | null) ?? "PHP",
      hourlyRate:
        showHourly && candidate.hourly_rate != null
          ? Number(candidate.hourly_rate)
          : null,
      availability: showHourly
        ? ((candidate.availability as string | null) ?? null)
        : null,
    },
  };
}
