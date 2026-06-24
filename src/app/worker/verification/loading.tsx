import { VerificationSkeleton } from "@/components/worker/verification/VerificationSkeleton";

export default function WorkerVerificationLoading() {
  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <VerificationSkeleton />
    </div>
  );
}
