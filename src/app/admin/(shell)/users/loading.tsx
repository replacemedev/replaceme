import { AdminListPageSkeleton } from "@/components/admin/shared/AdminSkeletons";

export default function AdminUsersLoading() {
  return <AdminListPageSkeleton withTabs tabCount={3} />;
}
