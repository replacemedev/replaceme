import { notFound } from "next/navigation";
import { Headphones } from "lucide-react";
import { getEmployerContract } from "@/actions/employer/contracts";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { ContractDetailClient } from "@/components/employer/contracts/ContractDetailClient";
import { ContractStatusTimeline } from "@/components/employer/contracts/ContractStatusTimeline";
import {
  EmployerBreadcrumb,
  EmployerPageHeader,
  EmployerPageShell,
  EmployerSectionCard,
} from "@/components/employer/layout";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

export const metadata = { title: "Contract | ReplaceMe" };
export const dynamic = "force-dynamic";

export default async function EmployerContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const [contract, planUsage] = await Promise.all([
    getEmployerContract(contractId),
    getEmployerPlanUsage(),
  ]);

  if (!contract) notFound();

  const planSlug = normalizePlanSlug(planUsage?.planSlug ?? "discovery");
  const isScale = planSlug === "scale";

  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12">
      <EmployerBreadcrumb
        items={[
          { label: "Hired workers", href: "/employer/hired" },
          { label: contract.workerName },
        ]}
      />

      <EmployerPageHeader
        title="Manage contract"
        subhead={`${contract.workerName} · ${contract.workerRole}${
          contract.jobTitle ? ` · ${contract.jobTitle}` : ""
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ContractStatusTimeline contract={contract} />
          <ContractDetailClient contract={contract} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          {isScale ? (
            <div className={`${EMPLOYER_CARD} p-5 space-y-2`}>
              <div className="flex items-center gap-2 text-[#006e2f]">
                <Headphones className="h-4 w-4" aria-hidden />
                <p className="text-sm font-bold text-slate-900">
                  Priority support
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Scale plan includes priority support for contract changes and
                team management questions.
              </p>
            </div>
          ) : null}

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
                <dd className="font-semibold text-[#006e2f] capitalize">
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
