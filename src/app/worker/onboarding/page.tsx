import { WorkerOnboardingWizard } from "@/components/worker/onboarding/WorkerOnboardingWizard";
import { WorkerPageShell } from "@/components/worker/layout";
import { getWorkerOnboardingDraft } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function WorkerOnboardingPage() {
  const draft = await getWorkerOnboardingDraft();
  if (!draft) redirect("/signin");

  return (
    <WorkerPageShell width="content" className="!py-0 gap-0">
      <div className="flex w-full min-w-0 flex-col gap-8 py-8 sm:gap-10 sm:py-12 md:gap-10 md:py-16 lg:gap-12 lg:py-20">
        <WorkerOnboardingWizard draft={draft} />
      </div>
    </WorkerPageShell>
  );
}
