import { AdminListPageSkeleton } from "@/components/admin/shared/AdminSkeletons";

export default function AdminJobsLoading() {
  return <AdminListPageSkeleton withTabs tabCount={5} />;
}
