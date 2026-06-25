import type { SupabaseClient } from "@supabase/supabase-js";

export async function getJobOwnedByEmployer(
  supabase: SupabaseClient,
  jobId: string,
  employerId: string
) {
  return supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("employer_id", employerId)
    .maybeSingle();
}

export async function closeJobOwnedByEmployer(
  supabase: SupabaseClient,
  jobId: string,
  employerId: string
) {
  return supabase
    .from("jobs")
    .update({ status: "Closed" })
    .eq("id", jobId)
    .eq("employer_id", employerId)
    .select()
    .single();
}
