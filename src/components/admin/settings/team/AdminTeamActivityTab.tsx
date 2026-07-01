import { AuditLogTable } from "@/components/admin/audit/AuditLogTable";
import type { AdminAuditLogRow } from "@/types/admin.types";

interface AdminTeamActivityTabProps {
  logs: AdminAuditLogRow[];
}

export function AdminTeamActivityTab({ logs }: AdminTeamActivityTabProps) {
  return <AuditLogTable logs={logs} />;
}
