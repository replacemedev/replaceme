import { Check } from "lucide-react";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

const STEPS = [
  { id: "basics", label: "Basics", description: "Title, type, and description" },
  {
    id: "requirements",
    label: "Requirements",
    description: "Skills and compensation",
  },
] as const;

interface JobCreateStepIndicatorProps {
  isEditMode?: boolean;
}

export function JobCreateStepIndicator({
  isEditMode = false,
}: JobCreateStepIndicatorProps) {
  if (isEditMode) {
    return (
      <div className={`${EMPLOYER_CARD} p-5 space-y-2`}>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Editing
        </p>
        <p className="text-sm font-bold text-slate-900">Update your listing</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Changes apply immediately to active jobs. Status and approval rules are
          unchanged.
        </p>
      </div>
    );
  }

  return (
    <nav aria-label="Job post steps" className={`${EMPLOYER_CARD} p-5`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Steps
      </p>
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.id} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ebfdf2] text-[#006e2f] text-xs font-extrabold">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-bold text-slate-900">{step.label}</p>
              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 flex items-center gap-2 text-[11px] font-medium text-slate-500 border-t border-slate-100 pt-4">
        <Check className="h-3.5 w-3.5 text-[#006e2f]" aria-hidden />
        Single-page form — scroll to complete each section
      </p>
    </nav>
  );
}
