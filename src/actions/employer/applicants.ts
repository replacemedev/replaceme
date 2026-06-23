"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { Applicant, MatchLabel } from "@/types/employer/applicants";
import { ApplicationStatus } from "@/types/applications";
import { revalidatePath } from "next/cache";

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { applicants: [], creditsBalance: 0, error: "Authentication failed." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { applicants: [], creditsBalance: 0, error: "Access denied. Employer role required." };
    }

    // Verify job ownership (IDOR check)
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("id", jobId)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return { applicants: [], creditsBalance: 0, error: "Access denied. You do not own this job posting." };
    }

    // Get or initialize employer credit balance
    let creditsBalance = 5;
    const { data: credits, error: creditsError } = await supabase
      .from("employer_credits")
      .select("credits_balance")
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (creditsError) {
      safeError("Error fetching credits:", creditsError);
    } else if (credits) {
      creditsBalance = credits.credits_balance;
    } else {
      // Initialize with 5 default credits if row doesn't exist
      const { data: newCredits } = await supabase
        .from("employer_credits")
        .insert({ employer_id: profile.id, credits_balance: 5 })
        .select("credits_balance")
        .single();
      if (newCredits) {
        creditsBalance = newCredits.credits_balance;
      }
    }

    // Fetch database applications
    const dbApplicants: Applicant[] = [];
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        candidate_id,
        status,
        match_score,
        created_at,
        profiles(first_name, last_name, avatar_url, email, role, bio, skills, professional_title)
      `)
      .eq("job_id", jobId);

    if (appsError) {
      safeError("Error fetching applications:", appsError);
    } else if (applications) {
      // Fetch all profiles currently unlocked by this employer
      const { data: unlocks } = await supabase
        .from("unlocked_profiles")
        .select("candidate_id")
        .eq("employer_id", profile.id);

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
        const resumeUrl = isUnlocked ? "/resumes/sample.pdf" : null; // stub resume url
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
          skills: candidate?.skills || ["React", "TypeScript"],
          experienceYears: 3,
          isUnlocked,
          avatarUrl,
          email,
          bio,
          resumeUrl,
          createdAt: app.created_at,
        });
      }
    }

    return { applicants: dbApplicants, creditsBalance };
  } catch (err) {
    safeError("getApplicants error occurred:", err);
    return { applicants: [], creditsBalance: 0, error: "An unexpected error occurred." };
  }
}

/**
 * @deprecated Use updateApplicationStatus from @/actions/applications
 */
export async function updateApplicantStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<{ success?: boolean; error?: string }> {
  const { updateApplicationStatus } = await import("@/actions/applications");
  const result = await updateApplicationStatus(applicationId, status);
  return result.success
    ? { success: true }
    : { error: result.error };
}

/**
 * Safely unlocks candidate profile details, deducting 1 credit from balance.
 * Implements strict IDOR validation (job ownership) and transactional integrity checks.
 */
export async function unlockCandidate(
  applicationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    safeLog(`[Auth] Unlock candidate profile initiated for app: ${applicationId}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Employer role required." };
    }

    // IDOR check: Verify employer owns the job related to this application
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("job_id, candidate_id")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { error: "Application not found." };
    }

    const candidateId = application.candidate_id;

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return { error: "Access denied. You do not own the job associated with this applicant." };
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from("unlocked_profiles")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("candidate_id", candidateId)
      .maybeSingle();

    if (existingUnlock) {
      return { success: true };
    }

    // Fetch credits balance
    const { data: credits, error: creditsError } = await supabase
      .from("employer_credits")
      .select("id, credits_balance")
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (creditsError || !credits || credits.credits_balance < 1) {
      return { error: "Insufficient credits. Please upgrade your plan." };
    }

    // Perform transaction: deduct credit and insert unlock receipt
    const newBalance = credits.credits_balance - 1;

    const { error: deductError } = await supabase
      .from("employer_credits")
      .update({ credits_balance: newBalance })
      .eq("id", credits.id);

    if (deductError) {
      safeError("Error deducting credits:", deductError);
      return { error: "Transaction failed. Could not deduct credits." };
    }

    const { error: insertError } = await supabase
      .from("unlocked_profiles")
      .insert({
        employer_id: profile.id,
        candidate_id: candidateId,
      });

    if (insertError) {
      safeError("Error inserting unlock receipt:", insertError);
      // Attempt to refund credit
      await supabase
        .from("employer_credits")
        .update({ credits_balance: credits.credits_balance })
        .eq("id", credits.id);

      return { error: "Transaction failed. Could not record profile unlock." };
    }

    safeLog(`[Auth] Candidate unlocked successfully: ${candidateId}`);
    return { success: true };
  } catch (err) {
    safeError("unlockCandidate error occurred:", err);
    return { error: "An unexpected error occurred during credit unlock." };
  }
}
