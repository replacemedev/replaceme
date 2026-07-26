import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AuditLogClient } from "@/components/admin/audit/AuditLogClient";
import { fetchAuditLogs } from "@/actions/admin-actions";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import { createAdminClient } from "@/lib/supabase/server";
import { filterAuditActionTypes } from "@/lib/admin/capability-scopes";

export const metadata = {
  title: "Audit Log | Admin",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  action?: string;
  from?: string;
  to?: string;
}>;

async function loadActionTypes(
  capabilities: Parameters<typeof filterAuditActionTypes>[1],
  isSuperAdmin: boolean
): Promise<string[]> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("action_type")
    .order("action_type", { ascending: true })
    .limit(500);
  const all = [
    ...new Set((data ?? []).map((r) => r.action_type).filter(Boolean)),
  ].sort();
  return filterAuditActionTypes(all, capabilities, isSuperAdmin);
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPageCapability("audit_log");
  const { capabilities, isSuperAdmin } = await getCurrentAdminCapabilities();

  const params = await searchParams;
  const [logs, actionTypes] = await Promise.all([
    fetchAuditLogs(500, {
      search: params.q,
      actionType: params.action,
      from: params.from,
      to: params.to,
    }),
    loadActionTypes(capabilities, isSuperAdmin),
  ]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Audit Log"
        description={
          isSuperAdmin
            ? "Immutable, append-only record of all privileged actions for SOC 2 / GDPR accountability."
            : "Need-to-know view of privileged actions in your granted modules."
        }
      />
      <Suspense fallback={null}>
        <AuditLogClient logs={logs} actionTypes={actionTypes} />
      </Suspense>
    </AdminPageShell>
  );
}
