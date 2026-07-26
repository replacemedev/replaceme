import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { StaffDirectoryGrid } from "@/components/shared/staff/StaffDirectoryGrid";
import { fetchAdminStaffDirectory } from "@/actions/admin/profile";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Staff Directory | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminStaffDirectoryPage() {
  await requireAdminPageCapability("settings");

  const result = await fetchAdminStaffDirectory();

  if (!result.success) {
    return (
      <AdminPageShell>
        <ErrorState
          title="Unable to load directory"
          description={result.error}
          retryHref="/admin/settings/directory"
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Staff directory"
        description="Active admins and moderators. Public /team only shows teammates who opt in."
      >
        <Link
          href="/team"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#006e2f] transition-colors hover:border-[#006e2f]/30 hover:bg-[#ebfdf2]/50"
        >
          Public page
          <ExternalLink size={12} aria-hidden />
        </Link>
      </AdminPageHeader>
      <StaffDirectoryGrid
        members={result.data}
        emptyMessage="No active staff profiles found."
      />
    </AdminPageShell>
  );
}
