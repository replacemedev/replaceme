import { EmployerOnboardingWizard } from "@/components/employer/onboarding/EmployerOnboardingWizard";
import { OnboardingPlanWelcome } from "@/components/employer/onboarding/OnboardingPlanWelcome";
import { EmployerPageShell } from "@/components/employer/layout";
import { getEmployerOnboardingDraft } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Employer Onboarding",
  description:
    "Set up your company profile and start hiring on the Discovery plan.",
};

export default async function EmployerOnboardingPage() {
  const draft = await getEmployerOnboardingDraft();
  if (!draft) redirect("/signin");

  return (
    <EmployerPageShell width="wide" className="!py-0 gap-0">
      <div className="flex w-full min-w-0 flex-col gap-6 py-6 sm:gap-8 sm:py-8 md:py-10">
        <header className="min-w-0 space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
            Welcome to Replaceme
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 break-words sm:text-3xl">
            Set up your employer account
          </h1>
          <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-slate-500 break-words">
            Tell us about your company so workers recognize you when you post
            jobs and review applicants.
          </p>
        </header>

        <div className="grid min-w-0 grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0 w-full">
            <EmployerOnboardingWizard draft={draft} />
          </div>
          <div className="min-w-0 w-full">
            <OnboardingPlanWelcome />
          </div>
        </div>
      </div>
    </EmployerPageShell>
  );
}
