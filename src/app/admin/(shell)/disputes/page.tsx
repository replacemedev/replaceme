import { EmptyState } from "@/components/shared/EmptyState";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Disputes | Admin",
};

export default function AdminDisputesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Disputes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Mediation queue for worker–employer conflicts. Authorization and
          workflow wiring is planned for a future sprint.
        </p>
      </header>

      <EmptyState
        icon={<Scale className="h-8 w-8 text-slate-400" aria-hidden />}
        title="Disputes module not yet active"
        description="This scaffold reserves the admin route and navigation slot. No dispute data is exposed until the backend workflow is implemented."
      />
    </div>
  );
}
