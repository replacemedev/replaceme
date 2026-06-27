import { EmployerOnboardingWizard } from "@/components/employer/onboarding/EmployerOnboardingWizard";
import { OnboardingPlanWelcome } from "@/components/employer/onboarding/OnboardingPlanWelcome";
import { OnboardingStepDots } from "@/components/employer/onboarding/OnboardingStepDots";
import { EmployerPageShell } from "@/components/employer/layout";

export const metadata = {
  title: "Employer Onboarding | ReplaceMe",
  description:
    "Set up your company profile and start hiring on the Discovery plan.",
};

export default function EmployerOnboardingPage() {
  return (
    <EmployerPageShell width="wide" className="gap-10">
      <header className="text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
          Welcome to ReplaceMe
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Set up your employer account
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
          Tell us about your company so workers recognize you when you post jobs
          and review applicants.
        </p>
        <OnboardingStepDots activeStep={0} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="order-1 lg:order-1">
          <EmployerOnboardingWizard />
        </div>
        <div className="order-2 lg:order-2">
          <OnboardingPlanWelcome />
        </div>
      </div>
    </EmployerPageShell>
  );
}
