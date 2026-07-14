"use server";

import { revalidatePath } from "next/cache";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import { updateApplicationStatusSchema, deleteApplicationSchema } from "@/lib/validations/applications";
import type { ApplicationStatus } from "@/types/applications";
import { assertEmployerCanAdvanceApplication } from "@/lib/server/entitlements";
import {
  invalidateEmployerApplicantsCache,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";
import { notifyWorkerStatusUpdate } from "@/actions/email";
import { safeError } from "@/utils/logger";

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
  status: ApplicationStatus,
  employmentStatus?: string | null,
  showHiredBadge?: boolean
): Promise<UpdateApplicationStatusResult> {
  const result = await runAction("updateApplicationStatus", async () => {
    const parsed = updateApplicationStatusSchema.parse({
      applicationId,
      status,
      employmentStatus,
      showHiredBadge,
    });
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

    const updatePayload: any = { status: parsed.status };
    if (parsed.status === "HIRED") {
      updatePayload.employment_status = parsed.employmentStatus || "Full-time";
      updatePayload.show_hired_badge = parsed.showHiredBadge ?? true;
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", parsed.applicationId);

    if (updateError) {
      return fail("Failed to update status in the database.");
    }

    if (parsed.status === "HIRED") {
      // Fetch details to auto-provision contract
      const { data: workerProfile } = await supabase
        .from("profiles")
        .select("hourly_rate")
        .eq("id", application.candidate_id)
        .single();
      
      const { data: jobDetails } = await supabase
        .from("jobs")
        .select("hours_per_week")
        .eq("id", application.job_id)
        .maybeSingle();

      const hourlyRate = workerProfile?.hourly_rate ?? 0;
      const weeklyHours = jobDetails?.hours_per_week ?? 40;
      const employmentType = (parsed.employmentStatus || "Full-time").toLowerCase();

      // Check if a contract already exists for this application/job/worker
      const { data: existingContract } = await supabase
        .from("contracts")
        .select("id")
        .eq("employer_id", profile.id)
        .eq("worker_id", application.candidate_id)
        .eq("job_id", application.job_id)
        .maybeSingle();

      if (existingContract) {
        await supabase
          .from("contracts")
          .update({
            status: "active",
            employment_status: parsed.employmentStatus || "Full-time",
            employment_type: employmentType === "contractual" || employmentType === "contract" ? "contract" : employmentType,
            show_hired_badge: parsed.showHiredBadge ?? true,
            hourly_rate: hourlyRate,
            weekly_hours: weeklyHours,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingContract.id);
      } else {
        await supabase
          .from("contracts")
          .insert({
            employer_id: profile.id,
            worker_id: application.candidate_id,
            job_id: application.job_id,
            hourly_rate: hourlyRate,
            weekly_hours: weeklyHours,
            employment_type: employmentType === "contractual" || employmentType === "contract" ? "contract" : employmentType,
            employment_status: parsed.employmentStatus || "Full-time",
            show_hired_badge: parsed.showHiredBadge ?? true,
            status: "active",
          });
      }
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

    try {
      await notifyWorkerStatusUpdate({
        applicationId: parsed.applicationId,
        status: parsed.status,
      });
    } catch (err) {
      safeError("updateApplicationStatus: worker email failed", err);
    }

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

    const admin = await createAdminClient();
    const { error: deleteError } = await admin
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
