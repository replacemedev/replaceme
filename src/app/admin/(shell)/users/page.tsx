import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { UsersClient } from "@/components/admin/users/UsersClient";
import {
  fetchAdminEmployers,
  fetchAdminWorkers,
} from "@/actions/admin-actions";

export const metadata = {
  title: "Users | Admin",
};

export const dynamic = "force-dynamic";

type UserTab = "workers" | "employers";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab: UserTab = params.tab === "employers" ? "employers" : "workers";

  const [workers, employers] = await Promise.all([
    fetchAdminWorkers(),
    fetchAdminEmployers(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Moderate worker and employer accounts across the marketplace."
      />

      <Suspense fallback={<div className="h-10 animate-pulse bg-slate-100 rounded-lg" />}>
        <AdminTabs
          tabs={[
            { id: "workers", label: "Workers", count: workers.length },
            { id: "employers", label: "Employers", count: employers.length },
          ]}
        />
      </Suspense>

      <UsersClient tab={tab} workers={workers} employers={employers} />
    </div>
  );
}
