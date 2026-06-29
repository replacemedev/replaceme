"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type WorkerAuditAction =
  | "worker.profile_updated"
  | "worker.application_submitted"
  | "worker.application_withdrawn"
  | "worker.verification_submitted"
  | "worker.contract_responded"
  | "worker.settings_updated";

async function getClientIp(): Promise<string | null> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null
  );
}

/** Worker-scoped audit rows (admin_id null, actor in metadata). */
export async function emitWorkerAuditLog(
  workerId: string,
  actionType: WorkerAuditAction,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  const ip = await getClientIp();

  await supabase.from("audit_logs").insert({
    admin_id: null,
    action_type: actionType,
    target_type: "worker",
    target_id: workerId,
    metadata: { actor_id: workerId, ...metadata },
    ip_address: ip,
  });
}
