import { Check } from "lucide-react";
import type { VerificationStep } from "@/types/verification";

interface VerificationStepperProps {
  steps: VerificationStep[];
}

function StepCircle({ state, index }: { state: VerificationStep["state"]; index: number }) {
  if (state === "completed") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006e2f] text-white shrink-0">
        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006e2f] text-white text-sm font-bold shrink-0 ring-4 ring-[#ebfdf2]">
        {index}
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-sm font-bold shrink-0">
      {index}
    </span>
  );
}

function Connector({ filled }: { filled: boolean }) {
  return (
    <div
      className={`hidden md:block flex-1 h-0.5 mx-2 rounded-full ${
        filled ? "bg-[#006e2f]" : "bg-slate-200"
      }`}
      aria-hidden
    />
  );
}

export function VerificationStepper({ steps }: VerificationStepperProps) {
  return (
    <nav aria-label="Verification progress" className="mb-8">
      <ol className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
        {steps.map((step, index) => {
          const connectorFilled =
            step.state === "completed" &&
            (steps[index + 1]?.state === "completed" ||
              steps[index + 1]?.state === "active");

          return (
            <li
              key={step.id}
              className="flex md:flex-1 md:items-center min-w-0"
              aria-current={step.state === "active" ? "step" : undefined}
            >
              <div className="flex items-center gap-3 md:flex-col md:gap-2 md:text-center md:flex-1 min-w-0">
                <StepCircle state={step.state} index={step.id} />
                <span
                  className={`text-xs md:text-sm font-semibold leading-tight text-left md:text-center whitespace-normal break-words max-w-[120px] md:max-w-none ${
                    step.state === "active"
                      ? "text-[#006e2f]"
                      : step.state === "completed"
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <Connector filled={connectorFilled} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
