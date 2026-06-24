import { SavedJobsSkeleton } from "@/components/worker/saved-jobs/SavedJobsSkeleton";

export default function WorkerSavedJobsLoading() {
  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <SavedJobsSkeleton />
    </div>
  );
}
