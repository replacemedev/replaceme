import { CardSkeleton } from "@/components/shared/skeletons/primitives";

export default function AdminDisputesLoading() {
  return (
    <div className="space-y-6">
      <CardSkeleton className="h-16" />
      <CardSkeleton className="h-64" />
    </div>
  );
}
