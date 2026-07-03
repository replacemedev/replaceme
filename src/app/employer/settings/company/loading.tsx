import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerCompanySettingsLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 animate-pulse">
      <EmployerPageHeader
        title="Company profile"
        subhead="Build your brand presence to attract top talent. This information is visible on your job postings."
      />
      <CardSkeleton minHeight="min-h-[500px]" />
    </EmployerPageShell>
  );
}
