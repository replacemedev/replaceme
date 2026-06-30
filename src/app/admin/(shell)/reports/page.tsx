import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminReportsClient } from "@/components/admin/reports/AdminReportsClient";
import { getAdminReports } from "@/actions/reports";

export const metadata = {
  title: "Reports | Admin",
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
        title="Reports"
        description="Bug reports and feedback submitted from Worker and Employer portals."
      />
      <AdminReportsClient initial={initial} />
    </AdminPageShell>
  );
}

