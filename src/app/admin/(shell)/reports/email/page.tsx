import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout/AdminPageShell";
import { isCurrentUserSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { listEmailMessages } from "@/actions/admin/email-management";
import { AdminEmailManagementClient } from "@/components/admin/reports/email/AdminEmailManagementClient";

export const metadata = {
  title: "Email Management | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEmailManagementPage() {
  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const initial = await listEmailMessages({ limit: 50 });

  return (
    <AdminPageShell width="wide">
      <AdminPageHeader
        title="Email Management"
        description="Broadcast updates and monitor delivery, bounces, and engagement."
      />
      <AdminEmailManagementClient
        initial={initial.messages}
        isSuperAdmin={isSuperAdmin}
      />
    </AdminPageShell>
  );
}

