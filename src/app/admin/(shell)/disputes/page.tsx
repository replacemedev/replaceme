import { EmptyState } from "@/components/shared/EmptyState";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Disputes | Admin",
};

export default function AdminDisputesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Disputes"
        description="Mediation queue for worker–employer conflicts. Authorization and workflow wiring is planned for a future sprint."
      />

      <EmptyState
        icon={<Scale className="h-8 w-8 text-slate-400" aria-hidden />}
        title="Disputes module not yet active"
        description="This scaffold reserves the admin route and navigation slot. No dispute data is exposed until the backend workflow is implemented."
      />
    </div>
  );
}
