import { WorkerOnboardingWizard } from "@/components/worker/onboarding/WorkerOnboardingWizard";
import { WorkerPageShell } from "@/components/worker/layout";

export default function WorkerOnboardingPage() {
  return (
    <WorkerPageShell width="content" className="py-16">
      <WorkerOnboardingWizard />
    </WorkerPageShell>
  );
}
