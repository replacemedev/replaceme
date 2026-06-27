import { Sparkles } from "lucide-react";
import type { EntitlementFeature } from "@/lib/entitlements/ui-copy";
import { featureGateCopy } from "@/lib/entitlements/ui-copy";
import { UpgradeCTA } from "./UpgradeCTA";

interface ContextualUpgradeBannerProps {
  feature: EntitlementFeature;
  currentPlan: string;
  dismissible?: boolean;
  className?: string;
}

export function ContextualUpgradeBanner({
  feature,
  currentPlan,
  className = "",
}: ContextualUpgradeBannerProps) {
  const copy = featureGateCopy(feature, currentPlan);

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{copy.title}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            {copy.description}
          </p>
        </div>
      </div>
      <UpgradeCTA
        feature={feature}
        currentPlan={currentPlan}
        className="shrink-0"
      />
    </div>
  );
}
