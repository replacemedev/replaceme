import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import type { SubscriptionTier } from "@/types/employer/billing";
import { Check, X } from "lucide-react";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";

type FeatureRow = {
  label: string;
  included: boolean;
};

function featuresForPlan(
  plan: SubscriptionTier,
  usage: EmployerPlanUsage | null
): FeatureRow[] {
  const slug = usage?.planSlug
    ? (usage.planSlug as SubscriptionTier)
    : plan;

  const messaging = usage?.messagingEnabled ?? slug !== "discovery";
  const resume = usage?.resumeDownloadEnabled ?? slug !== "discovery";
  const fullIdentity = usage?.identityMode === "full" || slug !== "discovery";

  return [
    {
      label:
        usage?.activeJobsLimit === null
          ? "Unlimited active job posts"
          : `Up to ${usage?.activeJobsLimit ?? 1} active job posts`,
      included: true,
    },
    {
      label:
        usage?.applicantsPerJobLimit === null
          ? "Unlimited applicants per job"
          : `Up to ${usage?.applicantsPerJobLimit ?? 10} applicants per job`,
      included: true,
    },
    {
      label: "Full candidate profiles",
      included: fullIdentity,
    },
    {
      label: "Direct messaging",
      included: messaging,
    },
    {
      label: "Resume downloads",
      included: resume,
    },
    {
      label: "Instant job approval",
      included: slug !== "discovery",
    },
    {
      label: "Priority listing",
      included: slug === "growth" || slug === "scale",
    },
    {
      label: "Priority support",
      included: slug === "scale",
    },
  ];
}

interface PlanFeatureChecklistProps {
  currentPlan: SubscriptionTier;
  planUsage: EmployerPlanUsage | null;
}

export function PlanFeatureChecklist({
  currentPlan,
  planUsage,
}: PlanFeatureChecklistProps) {
  const features = featuresForPlan(currentPlan, planUsage);
  const planLabel = TIER_LABELS[currentPlan];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">
        Your {planLabel} entitlements
      </h2>
      <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
        Included on your current plan. Upgrade anytime for more capacity and
        hiring tools.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature) => (
          <li
            key={feature.label}
            className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
              feature.included
                ? "border-emerald-100 bg-[#fafdfb] text-slate-700"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            {feature.included ? (
              <Check className="h-4 w-4 shrink-0 text-[#006e2f]" aria-hidden />
            ) : (
              <X className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
            )}
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
