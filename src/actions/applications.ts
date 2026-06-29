"use server";

import { revalidatePath } from "next/cache";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { updateApplicationStatusSchema } from "@/lib/validations/applications";
import type { ApplicationStatus } from "@/types/applications";
import { assertEmployerCanAdvanceApplication } from "@/lib/server/entitlements";
import {
  invalidateEmployerApplicantsCache,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";

const ADVANCE_STATUSES = new Set<ApplicationStatus>([
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
  "HIRED",
]);

export type UpdateApplicationStatusResult = {
  success: boolean;
  error?: string;
};

/**
 * Employer-only mutation: updates applications.status after verifying job ownership.
 * Revalidates worker and employer paths so both sides stay synchronized.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<UpdateApplicationStatusResult> {
  const result = await runAction("updateApplicationStatus", async () => {
    const parsed = updateApplicationStatusSchema.parse({ applicationId, status });
    const { supabase, profile } = await requireRole("employer");

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id")
      .eq("id", parsed.applicationId)
      .single();

    if (appError || !application) {
      return fail("Application not found.");
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return fail(
        "Access denied. You do not own the job associated with this application."
      );
    }

    if (parsed.status === "WITHDRAWN") {
      return fail("Only workers can withdraw applications.");
    }

    if (ADVANCE_STATUSES.has(parsed.status)) {
      const identityCheck = await assertEmployerCanAdvanceApplication(profile.id);
      if (!identityCheck.allowed) {
        return fail(identityCheck.error);
      }
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: parsed.status })
      .eq("id", parsed.applicationId);

    if (updateError) {
      return fail("Failed to update status in the database.");
    }

    await invalidateEmployerApplicantsCache(profile.id, application.job_id);
    await invalidateWorkerCache(application.candidate_id);

    const jobId = application.job_id;
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/employer/jobs/${jobId}/applicants`);
    revalidatePath("/employer/interviews");
    revalidatePath("/worker/applications");
    revalidatePath("/worker/dashboard");

    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}
