"use server";

import { safeError, safeLog } from "@/utils/logger";
import { Applicant, MatchLabel } from "@/types/employer/applicants";
import { ApplicationStatus } from "@/types/applications";
import { revalidatePath } from "next/cache";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { unlockCandidateSchema } from "@/lib/validations/applicants";
import { jobIdSchema } from "@/lib/validations/employer/jobs";
import {
  getApplicationsForJob,
  getUnlockedCandidateIds,
} from "@/lib/server/dal/applications";
import { getJobOwnedByEmployer } from "@/lib/server/dal/jobs";

/**
 * Fetch applicants for a specific jobId securely.
 * Checks session, confirms role, verifies job ownership (IDOR protection),
 * checks unlock status, masks locked profiles, and relies on DB queries.
 */
export async function getApplicants(jobId: string): Promise<{
  applicants: Applicant[];
  creditsBalance: number;
  error?: string;
}> {
  try {
    const parsed = jobIdSchema.parse({ jobId });
    const { supabase, profile } = await requireRole("employer");

    const { data: job, error: jobError } = await getJobOwnedByEmployer(
      supabase,
      parsed.jobId,
      profile.id
    );

    if (jobError || !job) {
      return { applicants: [], creditsBalance: 0, error: "Access denied. You do not own this job posting." };
    }

    const { data: credits, error: creditsError } = await supabase
      .from("employer_credits")
      .select("credits_balance")
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (creditsError) {
      safeError("Error fetching credits:", creditsError);
    }

    const creditsBalance = credits?.credits_balance ?? 0;

    const dbApplicants: Applicant[] = [];
    const { data: applications, error: appsError } = await getApplicationsForJob(
      supabase,
      parsed.jobId
    );

    if (appsError) {
      safeError("Error fetching applications:", appsError);
    } else if (applications) {
      const { data: unlocks } = await getUnlockedCandidateIds(
        supabase,
        profile.id
      );

      const unlockedCandidateIds = new Set(unlocks?.map((u) => u.candidate_id) || []);

      for (const app of applications) {
        const isUnlocked = unlockedCandidateIds.has(app.candidate_id);
        const candidate = app.profiles as any;

        // Mask details if locked
        const idClean = app.candidate_id.replace(/[^0-9]/g, "");
        const appCode = idClean.length >= 3 ? idClean.substring(0, 3) : "402";
        const name = isUnlocked
          ? `${candidate?.first_name || ""} ${candidate?.last_name || ""}`.trim()
          : `Applicant #${appCode}`;
        const email = isUnlocked ? candidate?.email || null : null;
        const bio = isUnlocked ? candidate?.bio || null : null;
        const resumeUrl = isUnlocked ? candidate?.resume_url ?? null : null;
        const avatarUrl = isUnlocked ? candidate?.avatar_url || null : null;

        const matchScore = app.match_score;
        let matchLabel: MatchLabel = "mid";
        if (matchScore >= 90) matchLabel = "high";
        else if (matchScore < 70) matchLabel = "low";

        dbApplicants.push({
          id: app.id,
          jobId: app.job_id,
          candidateId: app.candidate_id,
          name,
          role: candidate?.professional_title || "Developer",
          matchScore,
          matchLabel,
          status: app.status as ApplicationStatus,
          skills: candidate?.skills || [],
          experienceYears: candidate?.experience_years ?? 0,
          isUnlocked,
          avatarUrl,
          email,
          bio,
          resumeUrl,
          createdAt: app.created_at,
          isVerified: Boolean(candidate?.is_verified),
        });
      }
    }

    dbApplicants.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return b.matchScore - a.matchScore;
    });

    return { applicants: dbApplicants, creditsBalance };
  } catch (err) {
    safeError("getApplicants error occurred:", err);
    return { applicants: [], creditsBalance: 0, error: "An unexpected error occurred." };
  }
}

/**
 * Safely unlocks candidate profile details, deducting 1 credit from balance.
 * Implements strict IDOR validation (job ownership) and transactional integrity checks.
 */
export async function unlockCandidate(
  applicationId: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await runAction("unlockCandidate", async () => {
    const parsed = unlockCandidateSchema.parse({ applicationId });
    safeLog(`[Auth] Unlock candidate for app: ${parsed.applicationId}`);

    const { supabase, profile } = await requireRole("employer");

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("job_id, candidate_id")
      .eq("id", parsed.applicationId)
      .single();

    if (appError || !application) {
      return fail("Application not found.");
    }

    const candidateId = application.candidate_id;

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return fail(
        "Access denied. You do not own the job associated with this applicant."
      );
    }

    const { data: existingUnlock } = await supabase
      .from("unlocked_profiles")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("candidate_id", candidateId)
      .maybeSingle();

    if (existingUnlock) {
      return ok();
    }

    const { data: credits, error: creditsError } = await supabase
      .from("employer_credits")
      .select("id, credits_balance")
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (creditsError || !credits || credits.credits_balance < 1) {
      return fail("Insufficient credits. Please upgrade your plan.");
    }

    const newBalance = credits.credits_balance - 1;

    const { error: deductError } = await supabase
      .from("employer_credits")
      .update({ credits_balance: newBalance })
      .eq("id", credits.id);

    if (deductError) {
      return fail("Transaction failed. Could not deduct credits.");
    }

    const { error: insertError } = await supabase
      .from("unlocked_profiles")
      .insert({
        employer_id: profile.id,
        candidate_id: candidateId,
        application_id: parsed.applicationId,
      });

    if (insertError) {
      await supabase
        .from("employer_credits")
        .update({ credits_balance: credits.credits_balance })
        .eq("id", credits.id);
      return fail("Transaction failed. Could not record profile unlock.");
    }

    revalidatePath(`/employer/jobs/${application.job_id}/applicants`);
    return ok();
  });

  return result.success
    ? { success: true }
    : { error: result.error };
}
