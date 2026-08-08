import {
  EmployerPageShell,
  EmployerPageHeader,
} from "@/components/employer/layout";

export default function EmployerContractLoading() {
  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12 animate-pulse">
      <EmployerPageHeader
        title="Manage contract"
        subhead="Loading contract details..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Main Column Skeleton (Form) */}
        <div className="lg:col-span-2 h-[480px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm" />

        {/* Sidebar Skeleton (Summary) */}
        <div className="lg:col-span-1 h-[260px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm" />
      </div>
    </EmployerPageShell>
  );
}

