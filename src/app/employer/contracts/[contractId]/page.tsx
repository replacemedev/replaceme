import { notFound } from "next/navigation";
import { getEmployerContract } from "@/actions/employer/contracts";
import { ContractDetailClient } from "@/components/employer/contracts/ContractDetailClient";
import {
  EmployerPageHeader,
  EmployerPageShell,
  EmployerSectionCard,
} from "@/components/employer/layout";

export const metadata = { title: "Contract" };
export const dynamic = "force-dynamic";

export default async function EmployerContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const contract = await getEmployerContract(contractId);

  if (!contract) notFound();

  const isTerminated = contract.status.toLowerCase() === "terminated";
  const isActive = contract.status.toLowerCase() === "active";

  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12">
      <EmployerPageHeader
        title="Manage contract"
        subhead={`${contract.workerName} · ${contract.workerRole}${
          contract.jobTitle ? ` · ${contract.jobTitle}` : ""
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2">
          <ContractDetailClient contract={contract} />
        </div>

        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">
          <EmployerSectionCard
            title="Contract summary"
            description="Employment type and weekly commitment."
            padded
          >
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Type</dt>
                <dd className="font-semibold text-slate-900 capitalize">
                  {contract.employmentType}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Weekly hours</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {contract.weeklyHours}h
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Hourly rate</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  ${contract.hourlyRate.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Status</dt>
                <dd
                  className={`font-semibold capitalize ${
                    isTerminated
                      ? "text-red-600"
                      : isActive
                      ? "text-[#006e2f]"
                      : "text-slate-600"
                  }`}
                >
                  {contract.status}
                </dd>
              </div>
            </dl>
          </EmployerSectionCard>
        </aside>
      </div>
    </EmployerPageShell>
  );
}

