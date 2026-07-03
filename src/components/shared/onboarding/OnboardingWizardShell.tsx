import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingWizardShellProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  nextLabel?: string;
  isPending?: boolean;
  isNextDisabled?: boolean;
  accentClass?: string;
}

export function OnboardingWizardShell({
  currentStep,
  totalSteps,
  stepLabel,
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  canSkip = false,
  nextLabel = "Continue",
  isPending = false,
  isNextDisabled = false,
  accentClass = "bg-primary hover:bg-primary/90",
}: OnboardingWizardShellProps) {
  return (
    <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        label={stepLabel}
      />

      <header className="space-y-1">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl whitespace-normal break-words">{title}</h1>
        {description ? (
          <p className="text-xs font-medium leading-relaxed text-slate-600 sm:text-sm whitespace-normal break-words">{description}</p>
        ) : null}
      </header>

      <div key={`${currentStep}-${stepLabel}`} className="onboarding-step-enter">
        {children}
      </div>

      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
            >
              Back
            </button>
          ) : null}
          {canSkip && onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              disabled={isPending}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 sm:flex-none"
            >
              Skip for now
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={isPending || isNextDisabled}
          className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-50 sm:min-w-[140px] sm:w-auto ${accentClass}`}
        >
          {isPending ? "Saving…" : nextLabel}
        </button>
      </footer>
    </section>
  );
}
