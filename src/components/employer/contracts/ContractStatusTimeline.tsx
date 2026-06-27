import type { EmployerContractDetail } from "@/actions/employer/contracts";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

function visibleSteps(status: string) {
  const steps = [
    { key: "offered", label: "Offer sent" },
    { key: "active", label: "Active" },
  ];
  if (status === "paused") {
    steps.push({ key: "paused", label: "Paused" });
  }
  if (status === "terminated") {
    steps.push({ key: "terminated", label: "Terminated" });
  }
  return steps;
}

interface ContractStatusTimelineProps {
  contract: EmployerContractDetail;
}

export function ContractStatusTimeline({
  contract,
}: ContractStatusTimelineProps) {
  const steps = visibleSteps(contract.status);
  const currentIndex = steps.findIndex((s) => s.key === contract.status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const startLabel = new Date(contract.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={`${EMPLOYER_CARD} p-5 space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900">Contract timeline</h2>
        <span className="text-[11px] font-semibold text-slate-500">
          Started {startLabel}
        </span>
      </div>

      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <li
              key={step.key}
              className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center min-w-0"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-extrabold ${
                  isCurrent
                    ? "border-[#006e2f] bg-[#006e2f] text-white"
                    : isComplete
                      ? "border-[#006e2f] bg-[#ebfdf2] text-[#006e2f]"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-xs font-bold pt-0.5 ${
                  isCurrent ? "text-[#006e2f]" : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
