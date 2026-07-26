import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminReportsClient } from "@/components/admin/reports/AdminReportsClient";
import { getAdminReports } from "@/actions/reports";

export const metadata = {
  title: "Platform Reports | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  if (params.tab === "employers" || params.tab === "workers") {
    redirect(
      params.tab === "employers"
        ? "/admin/disputes?tab=financial"
        : "/admin/disputes?tab=safety"
    );
  }

  const initial = (await getAdminReports({ status: "open", limit: 25, offset: 0 })) ?? {
    items: [],
    total: 0,
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Platform Reports"
        description="Technical platform issues and job listing flags. Employer and worker Trust & Safety cases live in Disputes."
      />
      <AdminReportsClient initial={initial} />
    </AdminPageShell>
  );
}
