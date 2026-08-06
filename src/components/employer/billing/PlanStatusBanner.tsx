"use client";

import React from "react";
import Link from "next/link";
import { SubscriptionTier } from "@/types/employer/billing";
import {
  currentPlanBannerCopy,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";

export interface PlanStatusBannerProps {
  currentPlanSlug?: SubscriptionTier | string | null;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function PlanStatusBanner({
  currentPlanSlug,
  actionHref = "/employer/settings/account",
  actionLabel = "Account Settings",
  className = "max-w-3xl mx-auto mb-10",
}: PlanStatusBannerProps) {
  const safeSlug = currentPlanSlug ? String(currentPlanSlug) : "discovery";
  const normalized = normalizePlanSlug(safeSlug);

  // Discovery / free plan users do not render the paid plan status banner
  if (normalized === "discovery") {
    return null;
  }

  const { title, subtitle } = currentPlanBannerCopy(safeSlug);

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#006e2f]/20 bg-white px-5 py-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
            {subtitle}
          </p>
        </div>
        <Link
          href={actionHref}
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
