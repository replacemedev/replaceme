const STEPS = [
  { id: "company", label: "Company" },
  { id: "hiring", label: "Hiring focus" },
  { id: "details", label: "Details" },
] as const;

interface OnboardingStepDotsProps {
  activeStep?: number;
}

export function OnboardingStepDots({ activeStep = 0 }: OnboardingStepDotsProps) {
  return (
    <nav aria-label="Onboarding progress" className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                isActive
                  ? "bg-[#006e2f] text-white"
                  : isComplete
                    ? "bg-[#ebfdf2] text-[#006e2f] ring-1 ring-[#006e2f]/20"
                    : "bg-slate-100 text-slate-400"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              {index + 1}
            </span>
            <span
              className={`hidden sm:inline text-xs font-bold ${
                isActive ? "text-[#006e2f]" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                className="hidden sm:block w-8 h-px bg-slate-200 mx-1"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
