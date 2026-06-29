import type { SupabaseClient } from "@supabase/supabase-js";
import { assertEmployerMessaging } from "@/lib/server/entitlements";
import { fail, ok, type ActionResult } from "@/lib/server/action-result";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export async function employerHasMessagedThread(
  supabase: Supabase,
  threadId: string,
  employerId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("thread_id", threadId)
    .eq("sender_id", employerId);

  if (error) return false;
  return (count ?? 0) > 0;
}

/**
 * Employer-only: create or return a chat thread for a visible applicant on a job.
 * Requires Starter+ messaging entitlement (Discovery blocked).
 */
export async function ensureEmployerMessagingThread(
  supabase: Supabase,
  employerId: string,
  jobId: string,
  candidateId: string
): Promise<ActionResult<{ threadId: string }>> {
  const messagingCheck = await assertEmployerMessaging(employerId);
  if (!messagingCheck.allowed) {
    return fail(messagingCheck.error ?? "Messaging requires a paid plan.");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("employer_id", employerId)
    .maybeSingle();

  if (jobError || !job) {
    return fail("Job not found.");
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("candidate_id", candidateId)
    .eq("is_within_plan_cap", true)
    .maybeSingle();

  if (!application) {
    return fail("This candidate is not in your visible applicant list for this job.");
  }

  const { data: company, error: companyError } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("employer_id", employerId)
    .maybeSingle();

  if (companyError || !company) {
    return fail("Company profile not found.");
  }

  const { data: existing } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("worker_id", candidateId)
    .eq("company_profile_id", company.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    return ok({ threadId: existing.id });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("chat_threads")
    .insert({
      worker_id: candidateId,
      company_profile_id: company.id,
      job_id: jobId,
      blocked_reason: null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    const { data: retry } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("worker_id", candidateId)
      .eq("company_profile_id", company.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (retry) return ok({ threadId: retry.id });
    return fail("Failed to start conversation.");
  }

  return ok({ threadId: inserted.id });
}
