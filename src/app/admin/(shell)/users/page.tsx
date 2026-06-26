import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { AdminTabsSkeleton } from "@/components/admin/shared/AdminSkeletons";
import { UsersClient } from "@/components/admin/users/UsersClient";
import { ErrorState } from "@/components/shared/ErrorState";
import { fetchAdminUsersPageData } from "@/actions/admin-actions";

export const metadata = {
  title: "Users | Admin",
};

export const dynamic = "force-dynamic";

import type { AdminUserTab } from "@/types/admin.types";

function parseUserTab(tab?: string): AdminUserTab {
  if (tab === "employers") return "employers";
  if (tab === "admins") return "admins";
  return "workers";
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = parseUserTab(params.tab);

  const result = await fetchAdminUsersPageData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="User Management"
          description="Moderate worker, employer, and admin accounts across the marketplace."
        />
        <ErrorState
          title="Unable to load users"
          description={result.error}
          retryHref="/admin/users"
        />
      </div>
    );
  }

  const { workers, employers, admins } = result.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Browse and moderate accounts by role — workers, employers, and platform admins."
      />

      <Suspense fallback={<AdminTabsSkeleton count={3} />}>
        <AdminTabs
          tabs={[
            { id: "workers", label: "Workers", count: workers.length },
            { id: "employers", label: "Employers", count: employers.length },
            { id: "admins", label: "Admins", count: admins.length },
          ]}
        />
      </Suspense>

      <UsersClient
        tab={tab}
        workers={workers}
        employers={employers}
        admins={admins}
      />
    </div>
  );
}
