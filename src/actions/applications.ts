"use server";

import { revalidatePath } from "next/cache";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { updateApplicationStatusSchema, deleteApplicationSchema } from "@/lib/validations/applications";
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

    // Sync associated interview status
    if (parsed.status !== "INTERVIEW_SCHEDULED") {
      const { data: interview } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", parsed.applicationId)
        .maybeSingle();

      if (interview) {
        const nextInterviewStatus = parsed.status === "HIRED" ? "completed" : "cancelled";
        await supabase
          .from("interviews")
          .update({ status: nextInterviewStatus })
          .eq("id", interview.id);
      }
    } else {
      // If status is INTERVIEW_SCHEDULED, check if an interview record exists.
      // If not, auto-create a default one so the page is not empty.
      const { data: interview } = await supabase
        .from("interviews")
        .select("id")
        .eq("application_id", parsed.applicationId)
        .maybeSingle();

      if (!interview) {
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);

        await supabase.from("interviews").insert({
          application_id: parsed.applicationId,
          employer_id: profile.id,
          worker_id: application.candidate_id,
          job_id: application.job_id,
          scheduled_at: tomorrow.toISOString(),
          status: "scheduled",
        });
      }
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

export async function deleteApplication(
  applicationId: string
): Promise<UpdateApplicationStatusResult> {
  const result = await runAction("deleteApplication", async () => {
    const parsed = deleteApplicationSchema.parse({ applicationId });
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

    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", parsed.applicationId);

    if (deleteError) {
      return fail("Failed to delete application from the database.");
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
