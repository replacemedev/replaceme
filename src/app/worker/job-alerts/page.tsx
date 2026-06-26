import { redirect } from "next/navigation";
import { getWorkerJobAlerts } from "@/actions/worker/phase2";
import { JobAlertsClient } from "@/components/worker/job-alerts/JobAlertsClient";

export const metadata = {
  title: "Job Alerts | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerJobAlertsPage() {
  const alerts = await getWorkerJobAlerts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Job Alerts</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Saved searches and real-time job notifications.
      </p>
      <JobAlertsClient alerts={alerts} />
    </div>
  );
}
