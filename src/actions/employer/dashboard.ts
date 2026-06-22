"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { JobPost, RecentApplicant } from "@/types/employer";

/**
 * Helper function to verify that the active session belongs to an employer
 * and matches the requested profile ID to prevent IDOR attacks.
 */
async function verifyEmployerSession(employerProfileId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    // Fetch the user's role and profile ID directly from the database (never trust client claims)
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (dbError || !profile) {
      return false;
    }

    // Verify role is employer and ID matches to prevent IDOR
    if (profile.role !== "employer" || profile.id !== employerProfileId) {
      return false;
    }

    return true;
  } catch (err) {
    safeError("Authentication check failed", err);
    return false;
  }
}

/**
 * Fetches actual job posts for an employer directly from the database.
 * Resolves applicants count and hits (views) count from live records.
 */
export async function getRecentJobs(employerProfileId: string): Promise<JobPost[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  try {
    const supabase = await createClient();
    
    // Query jobs joined with applications to calculate applicants count
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        created_at,
        status,
        views_count,
        applications (
          id
        )
      `)
      .eq("employer_id", employerProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      safeError("getRecentJobs query failed", error);
      return [];
    }

    if (!jobs) {
      return [];
    }

    return jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      created_at: job.created_at,
      applicants_count: job.applications ? job.applications.length : 0,
      hits_count: job.views_count || 0,
      status: job.status,
    }));
  } catch (err) {
    safeError("getRecentJobs unexpected error", err);
    return [];
  }
}

/**
 * Fetches actual recent applications for jobs owned by the employer.
 * Applies strict candidate data masking if the profile has not been unlocked.
 */
export async function getRecentApplicants(employerProfileId: string): Promise<RecentApplicant[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  try {
    const supabase = await createClient();

    // 1. Fetch employer's jobs list first to obtain IDs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id")
      .eq("employer_id", employerProfileId);

    if (jobsError) {
      safeError("getRecentApplicants fetching jobs failed", jobsError);
      return [];
    }

    if (!jobs || jobs.length === 0) {
      return [];
    }

    const jobIds = jobs.map((j) => j.id);

    // 2. Fetch recent applications for these jobs
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        candidate_id,
        created_at,
        status,
        job_id,
        jobs (
          id,
          title
        ),
        profiles (
          id,
          first_name,
          last_name,
          avatar_url,
          professional_title
        )
      `)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false })
      .limit(5);

    if (appsError) {
      safeError("getRecentApplicants query failed", appsError);
      return [];
    }

    if (!apps || apps.length === 0) {
      return [];
    }

    // 3. Fetch unlocked profiles to handle candidate privacy masking
    const { data: unlocks, error: unlocksError } = await supabase
      .from("unlocked_profiles")
      .select("candidate_id")
      .eq("employer_id", employerProfileId);

    if (unlocksError) {
      safeError("getRecentApplicants fetching unlocks failed", unlocksError);
    }

    const unlockedSet = new Set(unlocks?.map((u) => u.candidate_id) || []);

    return apps.map((app: any) => {
      const isUnlocked = unlockedSet.has(app.candidate_id);
      const candidate = app.profiles;
      const job = app.jobs;
      
      // Mask candidate details if profile is locked
      const idClean = app.candidate_id.replace(/[^0-9]/g, "");
      const appCode = idClean.length >= 3 ? idClean.substring(0, 3) : "402";
      
      const name = isUnlocked
        ? `${candidate?.first_name || ""} ${candidate?.last_name || ""}`.trim()
        : `Applicant #${appCode}`;
        
      const avatarUrl = isUnlocked ? candidate?.avatar_url || null : null;

      return {
        id: app.id,
        candidate_id: app.candidate_id,
        name,
        applied_role: job?.title || candidate?.professional_title || "Specialist",
        created_at: app.created_at,
        avatar_url: avatarUrl,
        is_unlocked: isUnlocked,
        job_id: app.job_id,
      };
    });
  } catch (err) {
    safeError("getRecentApplicants unexpected error", err);
    return [];
  }
}
