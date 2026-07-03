import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerReviewsLoading() {
  return (
    <EmployerPageShell width="content" className="animate-pulse">
      <EmployerPageHeader
        title="Worker reviews"
        subhead="Leave testimonials for workers you have hired on your team."
      />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[140px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
