import { redirect } from "next/navigation";
import { getWorkerJobAlerts } from "@/actions/worker/phase2";
import { JobAlertsClient } from "@/components/worker/job-alerts/JobAlertsClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = {
  title: "Job Alerts | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerJobAlertsPage() {
  const alerts = await getWorkerJobAlerts();

  return (
    <WorkerPageShell width="narrow">
      <WorkerPageHeader
        title="Job alerts"
        subhead="Saved searches and real-time job notifications."
      />
      <JobAlertsClient alerts={alerts} />
    </WorkerPageShell>
  );
}
