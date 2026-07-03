import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton } from "@/components/shared/skeletons/primitives";

export default function EmployerCompanySettingsLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 animate-pulse">
      <EmployerPageHeader
        title="Company profile"
        subhead="Build your brand presence to attract top talent. This information is visible on your job postings."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <CardSkeleton minHeight="min-h-[500px]" />
        <CardSkeleton minHeight="min-h-[400px]" />
      </div>
    </EmployerPageShell>
  );
}
