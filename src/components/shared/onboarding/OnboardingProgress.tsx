interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  label,
}: OnboardingProgressProps) {
  const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="space-y-2" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className="truncate">
          Step {currentStep} of {totalSteps}
          {label ? ` · ${label}` : ""}
        </span>
        <span className="tabular-nums text-slate-400 shrink-0">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
