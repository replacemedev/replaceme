"use server";

import { emitAuditLog } from "@/lib/server/audit/emit-audit-log";

export type WorkerAuditAction =
  | "worker.profile_updated"
  | "worker.application_submitted"
  | "worker.application_withdrawn"
  | "worker.verification_submitted"
  | "worker.contract_responded"
  | "worker.settings_updated";

/** Worker-scoped audit rows (admin_id null, actor in metadata). */
export async function emitWorkerAuditLog(
  workerId: string,
  actionType: WorkerAuditAction,
  metadata?: Record<string, unknown>
) {
  await emitAuditLog({
    adminId: null,
    actionType,
    targetType: "worker",
    targetId: workerId,
    metadata: { actor_id: workerId, ...metadata },
  });
}
