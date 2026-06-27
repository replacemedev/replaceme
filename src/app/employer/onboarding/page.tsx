import { EmployerOnboardingWizard } from "@/components/employer/onboarding/EmployerOnboardingWizard";
import { OnboardingPlanWelcome } from "@/components/employer/onboarding/OnboardingPlanWelcome";

export const metadata = {
  title: "Employer Onboarding | ReplaceMe",
  description:
    "Set up your company profile and start hiring on the Discovery plan.",
};

export default function EmployerOnboardingPage() {
  return (
    <section className="px-margin-desktop py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
            Welcome to ReplaceMe
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Set up your employer account
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 max-w-xl mx-auto">
            Tell us about your company so workers recognize you when you post
            jobs and review applicants.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <EmployerOnboardingWizard />
          <OnboardingPlanWelcome />
        </div>
      </div>
    </section>
  );
}
