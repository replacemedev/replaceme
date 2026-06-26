import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEmployerContract } from "@/actions/employer/contracts";
import { ContractDetailClient } from "@/components/employer/contracts/ContractDetailClient";

export const metadata = { title: "Contract | ReplaceMe" };
export const dynamic = "force-dynamic";

export default async function EmployerContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const contract = await getEmployerContract(contractId);
  if (!contract) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
      <Link
        href="/employer/hired"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006e2f] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to hired workers
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Manage contract</h1>
      <p className="text-sm text-slate-500 mb-8">Edit rates, pause, or terminate.</p>
      <ContractDetailClient contract={contract} />
    </div>
  );
}
