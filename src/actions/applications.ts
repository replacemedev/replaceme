"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import {
  ApplicationStatus,
  isApplicationStatus,
} from "@/types/applications";
import { revalidatePath } from "next/cache";

export interface UpdateApplicationStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Employer-only mutation: updates applications.status after verifying job ownership.
 * Revalidates worker and employer paths so both sides stay synchronized.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<UpdateApplicationStatusResult> {
  try {
    if (!isApplicationStatus(status)) {
      return { success: false, error: "Invalid application status." };
    }

    safeLog(
      `[Auth] updateApplicationStatus app=${applicationId} status=${status}`
    );

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication failed. Please log in." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { success: false, error: "Access denied. Employer role required." };
    }

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "Application not found." };
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return {
        success: false,
        error: "Access denied. You do not own the job associated with this application.",
      };
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (updateError) {
      safeError("updateApplicationStatus:", updateError);
      return { success: false, error: "Failed to update status in the database." };
    }

    const jobId = application.job_id;
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/employer/jobs/${jobId}/applicants`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/dashboard");

    return { success: true };
  } catch (err) {
    safeError("updateApplicationStatus:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
