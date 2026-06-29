import { getWorkerContracts } from "@/actions/worker/contracts";
import { ContractsClient } from "@/components/worker/contracts/ContractsClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = {
  title: "Contract Offers | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerContractsPage() {
  const contracts = await getWorkerContracts();

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Contract offers"
        subhead="Review and respond to employment offers from employers."
      />
      <ContractsClient contracts={contracts} />
    </WorkerPageShell>
  );
}
