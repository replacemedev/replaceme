import type { ReactNode } from "react";
import type { EntitlementFeature } from "@/lib/entitlements/ui-copy";
import { UnlockOverlay } from "./UnlockOverlay";

interface FeatureGateProps {
  allowed: boolean;
  feature: EntitlementFeature;
  currentPlan: string;
  children: ReactNode;
  compact?: boolean;
  preview?: ReactNode;
  className?: string;
}

export function FeatureGate({
  allowed,
  feature,
  currentPlan,
  children,
  compact = false,
  preview,
  className = "",
}: FeatureGateProps) {
  if (allowed) {
    return <>{children}</>;
  }

  if (preview) {
    return (
      <div className={`relative ${className}`}>
        <div className="pointer-events-none select-none opacity-60 blur-[2px]">
          {preview}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="pointer-events-auto w-full max-w-sm">
            <UnlockOverlay
              feature={feature}
              currentPlan={currentPlan}
              compact={compact}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UnlockOverlay
      feature={feature}
      currentPlan={currentPlan}
      compact={compact}
      className={className}
    />
  );
}
