import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AuditLogTable } from "@/components/admin/audit/AuditLogTable";
import { fetchAuditLogs } from "@/actions/admin-actions";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Audit Log | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  await requireAdminPageCapability("audit_log");

  const logs = await fetchAuditLogs(200);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Audit Log"
        description="Immutable record of all privileged admin actions."
      />
      <AuditLogTable logs={logs} />
    </AdminPageShell>
  );
}
