"use client";

import { createContext, use, type ReactNode } from "react";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";

type EntitlementContextValue = EmployerPlanUsage & {
  planSlugNormalized: ReturnType<typeof normalizePlanSlug>;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

interface EntitlementProviderProps {
  usage: EmployerPlanUsage;
  children: ReactNode;
}

export function EntitlementProvider({ usage, children }: EntitlementProviderProps) {
  const value: EntitlementContextValue = {
    ...usage,
    planSlugNormalized: normalizePlanSlug(usage.planSlug),
  };

  return (
    <EntitlementContext value={value}>{children}</EntitlementContext>
  );
}

export function useEmployerEntitlements(): EntitlementContextValue {
  const ctx = use(EntitlementContext);
  if (!ctx) {
    throw new Error("useEmployerEntitlements must be used within EntitlementProvider");
  }
  return ctx;
}

export function useEmployerEntitlementsOptional(): EntitlementContextValue | null {
  return use(EntitlementContext);
}
