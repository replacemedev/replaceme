import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminReportsClient } from "@/components/admin/reports/AdminReportsClient";
import { getAdminReports } from "@/actions/reports";

export const metadata = {
  title: "Trust & Safety Reports | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const initial = (await getAdminReports({ status: "open", limit: 25, offset: 0 })) ?? {
    items: [],
    total: 0,
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Trust & Safety Reports"
        description="Confidential moderation queue for platform issues, job flags, and user-to-user reports. Reporter identity is never disclosed to the reported party."
      />
      <AdminReportsClient initial={initial} />
    </AdminPageShell>
  );
}

