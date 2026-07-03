import { WorkerPageShell } from "@/components/worker/layout";
import { VerificationSkeleton } from "@/components/worker/verification/VerificationSkeleton";

export default function WorkerVerificationLoading() {
  return (
    <WorkerPageShell width="content">
      <VerificationSkeleton />
    </WorkerPageShell>
  );
}
