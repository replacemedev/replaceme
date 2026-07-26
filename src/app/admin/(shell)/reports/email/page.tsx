import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout/AdminPageShell";
import { isCurrentUserSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { listEmailMessages } from "@/actions/admin/email-management";
import { getBroadcastComplianceStatus } from "@/actions/admin/email-broadcasts";
import {
  getScaleEarlyAccessEnabled,
  listEmailTemplates,
} from "@/actions/admin/email-templates";
import { listProductAnnouncements } from "@/actions/admin/announcements";
import { AdminEmailManagementClient } from "@/components/admin/reports/email/AdminEmailManagementClient";

export const metadata = {
  title: "Email Management | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEmailManagementPage() {
  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const [initial, compliance, scaleEarlyAccess, templates, announcements] =
    await Promise.all([
      listEmailMessages({ limit: 50 }),
      getBroadcastComplianceStatus(),
      getScaleEarlyAccessEnabled(),
      listEmailTemplates(),
      listProductAnnouncements(),
    ]);

  return (
    <AdminPageShell width="wide">
      <AdminPageHeader
        title="Email Management"
        description="Broadcasts, transactional templates, Scale Early Access announcements, and delivery logs."
      />
      <AdminEmailManagementClient
        initial={initial.messages}
        isSuperAdmin={isSuperAdmin}
        broadcastReady={compliance.ready}
        scaleEarlyAccess={scaleEarlyAccess}
        initialTemplates={templates.templates}
        initialAnnouncements={announcements.announcements}
      />
    </AdminPageShell>
  );
}
