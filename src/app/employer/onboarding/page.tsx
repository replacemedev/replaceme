import { EmployerOnboardingWizard } from "@/components/employer/onboarding/EmployerOnboardingWizard";
import { OnboardingPlanWelcome } from "@/components/employer/onboarding/OnboardingPlanWelcome";
import { EmployerPageShell } from "@/components/employer/layout";
import { getEmployerOnboardingDraft } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Employer Onboarding | ReplaceMe",
  description:
    "Set up your company profile and start hiring on the Discovery plan.",
};

export default async function EmployerOnboardingPage() {
  const draft = await getEmployerOnboardingDraft();
  if (!draft) redirect("/signin");

  return (
    <EmployerPageShell width="wide" className="gap-8 sm:gap-10">
      <header className="space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
          Welcome to ReplaceMe
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Set up your employer account
        </h1>
        <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-slate-500">
          Tell us about your company so workers recognize you when you post jobs
          and review applicants.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <EmployerOnboardingWizard draft={draft} />
        <OnboardingPlanWelcome />
      </div>
    </EmployerPageShell>
  );
}
