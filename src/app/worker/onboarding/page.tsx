import { WorkerOnboardingWizard } from "@/components/worker/onboarding/WorkerOnboardingWizard";
import { WorkerPageShell } from "@/components/worker/layout";
import { getWorkerOnboardingDraft } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function WorkerOnboardingPage() {
  const draft = await getWorkerOnboardingDraft();
  if (!draft) redirect("/signin");

  return (
    <WorkerPageShell width="content" className="py-8 sm:py-16">
      <WorkerOnboardingWizard draft={draft} />
    </WorkerPageShell>
  );
}
