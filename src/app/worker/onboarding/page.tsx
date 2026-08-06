import { WorkerOnboardingWizard } from "@/components/worker/onboarding/WorkerOnboardingWizard";
import { WorkerPageShell } from "@/components/worker/layout";
import { getWorkerOnboardingDraft } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function WorkerOnboardingPage() {
  const draft = await getWorkerOnboardingDraft();
  if (!draft) redirect("/signin");

  return (
    <WorkerPageShell width="content" className="!py-0 gap-0">
      <div className="flex w-full min-w-0 flex-col gap-6 py-6 sm:gap-8 sm:py-8 md:py-10">
        <WorkerOnboardingWizard draft={draft} />
      </div>
    </WorkerPageShell>
  );
}
