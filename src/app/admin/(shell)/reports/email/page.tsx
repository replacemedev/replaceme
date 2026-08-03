import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout/AdminPageShell";
import { listEmailMessages } from "@/actions/admin/email-management";
import { getBroadcastComplianceStatus } from "@/actions/admin/email-broadcasts";
import {
  getScaleEarlyAccessEnabled,
  listEmailTemplates,
} from "@/actions/admin/email-templates";
import { listProductAnnouncements } from "@/actions/admin/announcements";
import { AdminEmailManagementClient } from "@/components/admin/reports/email/AdminEmailManagementClient";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Email Management | Admin",
};

export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "queued",
  "scheduled",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "delayed",
  "bounced",
  "complained",
  "suppressed",
  "failed",
];

export default async function AdminEmailManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdminPageCapability("email");

  const resolvedParams = searchParams ? await searchParams : {};
  const kindParam =
    typeof resolvedParams.kind === "string" &&
    ["transactional", "broadcast"].includes(resolvedParams.kind)
      ? (resolvedParams.kind as "transactional" | "broadcast")
      : undefined;
  const statusParam =
    typeof resolvedParams.status === "string" &&
    VALID_STATUSES.includes(resolvedParams.status)
      ? (resolvedParams.status as never)
      : undefined;

  const [initial, compliance, scaleEarlyAccess, templates, announcements] =
    await Promise.all([
      listEmailMessages({ limit: 50, kind: kindParam, status: statusParam }),
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
        isSuperAdmin
        broadcastReady={compliance.ready}
        scaleEarlyAccess={scaleEarlyAccess}
        initialTemplates={templates.templates}
        initialAnnouncements={announcements.announcements}
      />
    </AdminPageShell>
  );
}

