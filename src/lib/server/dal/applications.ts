import type { SupabaseClient } from "@supabase/supabase-js";

const APPLICATION_WITH_CANDIDATE_SELECT = `
  id,
  job_id,
  candidate_id,
  status,
  match_score,
  created_at,
  profiles(first_name, middle_name, last_name, avatar_url, email, role, bio, skills, professional_title, is_verified, experience_years, resume_url)
`;

export async function getApplicationsForJob(
  supabase: SupabaseClient,
  jobId: string
) {
  return supabase
    .from("applications")
    .select(APPLICATION_WITH_CANDIDATE_SELECT)
    .eq("job_id", jobId);
}

export async function getUnlockedCandidateIds(
  supabase: SupabaseClient,
  employerId: string
) {
  return supabase
    .from("unlocked_profiles")
    .select("candidate_id")
    .eq("employer_id", employerId);
}
