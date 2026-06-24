"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return { supabase, user };
}

async function getClientIp(): Promise<string | null> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null
  );
}

export async function logAdminAction(
  actionType: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const { supabase, user } = await verifyAdmin();
  const ip = await getClientIp();

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action_type: actionType,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: metadata ?? {},
    ip_address: ip,
  });
}

export async function suspendUser(userId: string, reason: string) {
  const { supabase, user } = await verifyAdmin();

  await logAdminAction("suspend_user", "profile", userId, { reason });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");

  return { success: true };
}

export async function deleteJobPost(jobId: string, reason: string) {
  const { supabase, user } = await verifyAdmin();

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) throw new Error(`Failed to delete job: ${error.message}`);

  await logAdminAction("delete_job_post", "job", jobId, { reason });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/jobs");

  return { success: true };
}

export async function fetchDashboardMetrics() {
  const { supabase } = await verifyAdmin();

  const [
    { count: totalWorkers },
    { count: totalEmployers },
    { count: activeJobs },
    { count: totalApplications },
    { count: activeContracts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker"),
    supabase
      .from("company_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "Active"),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  return {
    totalUsers: (totalWorkers ?? 0) + (totalEmployers ?? 0),
    totalWorkers: totalWorkers ?? 0,
    totalEmployers: totalEmployers ?? 0,
    activeJobs: activeJobs ?? 0,
    totalApplications: totalApplications ?? 0,
    activeContracts: activeContracts ?? 0,
  };
}

export async function fetchRecentAuditLogs(limit = 10) {
  const { supabase } = await verifyAdmin();

  const { data } = await supabase
    .from("audit_logs")
    .select("id, action_type, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
