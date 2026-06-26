import { getWorkerContracts } from "@/actions/worker/contracts";
import { ContractsClient } from "@/components/worker/contracts/ContractsClient";

export const metadata = {
  title: "Contract Offers | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerContractsPage() {
  const contracts = await getWorkerContracts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Contract Offers</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Review and respond to employment offers from employers.
      </p>
      <ContractsClient contracts={contracts} />
    </div>
  );
}
