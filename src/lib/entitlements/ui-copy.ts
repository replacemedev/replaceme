import type { SubscriptionTier } from "@/types/employer/billing";

export type EntitlementFeature =
  | "identity"
  | "messaging"
  | "resume"
  | "job_limit"
  | "applicant_cap"
  | "priority_listing"
  | "priority_support"
  | "early_access";

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  discovery: 0,
  starter: 19,
  growth: 39,
  scale: 79,
};

/** Yearly prepaid totals (USD). Prefer billing_plans.annual_price when available. */
export const TIER_ANNUAL_PRICES: Record<
  Exclude<SubscriptionTier, "discovery">,
  number
> = {
  starter: 156,
  growth: 312,
  scale: 624,
};

/** Monthly-equivalent display for annual prepaid. */
export const TIER_ANNUAL_MONTHLY: Record<
  Exclude<SubscriptionTier, "discovery">,
  number
> = {
  starter: 13,
  growth: 26,
  scale: 52,
};

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const UPGRADE_PATH: Record<string, SubscriptionTier> = {
  discovery: "starter",
  starter: "growth",
  growth: "scale",
  scale: "scale",
};

export const TIER_RANK: Record<SubscriptionTier, number> = {
  discovery: 0,
  starter: 1,
  growth: 2,
  scale: 3,
};

export function comparePlanTiers(
  targetPlan: string,
  currentPlan: string
): number {
  return (
    TIER_RANK[normalizePlanSlug(targetPlan)] -
    TIER_RANK[normalizePlanSlug(currentPlan)]
  );
}

export function isHigherTier(targetPlan: string, currentPlan: string): boolean {
  return comparePlanTiers(targetPlan, currentPlan) > 0;
}

export function isLowerTier(targetPlan: string, currentPlan: string): boolean {
  return comparePlanTiers(targetPlan, currentPlan) < 0;
}

export function isCurrentTier(targetPlan: string, currentPlan: string): boolean {
  return normalizePlanSlug(targetPlan) === normalizePlanSlug(currentPlan);
}

export function normalizePlanSlug(plan: string): SubscriptionTier {
  const slug = plan.toLowerCase();
  if (
    slug === "discovery" ||
    slug === "starter" ||
    slug === "growth" ||
    slug === "scale"
  ) {
    return slug;
  }
  if (slug === "essential") return "starter";
  if (slug === "professional") return "growth";
  return "discovery";
}

export function currentPlanBannerCopy(planSlug?: string | null): {
  title: string;
  subtitle: string;
  isScale: boolean;
} {
  const safeSlug = planSlug ? String(planSlug) : "discovery";
  const normalized = normalizePlanSlug(safeSlug);
  const tierLabel = TIER_LABELS[normalized] ?? "Paid";
  const isScale = normalized === "scale";

  return {
    title: `You're on the ${tierLabel} plan`,
    subtitle: isScale
      ? "Manage your subscription and billing in account settings. Downgrades take effect at the end of your billing cycle."
      : "Upgrade to unlock more jobs and applicants, or manage billing in account settings. Downgrades take effect at the end of your billing cycle.",
    isScale,
  };
}

export function suggestedUpgradeTier(
  currentPlan: string,
  feature?: EntitlementFeature
): SubscriptionTier {
  const slug = normalizePlanSlug(currentPlan);
  if (
    feature === "messaging" ||
    feature === "resume" ||
    feature === "identity"
  ) {
    return slug === "discovery" ? "starter" : UPGRADE_PATH[slug] ?? "starter";
  }
  if (feature === "early_access" || feature === "priority_support") {
    return "scale";
  }
  return UPGRADE_PATH[slug] ?? "starter";
}

export type FeatureGateCopy = {
  title: string;
  description: string;
  tier: SubscriptionTier;
  price: number;
  tierLabel: string;
};

export function featureGateCopy(
  feature: EntitlementFeature,
  currentPlan: string
): FeatureGateCopy {
  const tier = suggestedUpgradeTier(currentPlan, feature);
  const tierLabel = TIER_LABELS[tier];
  const price = TIER_PRICES[tier];

  switch (feature) {
    case "identity":
      return {
        title: "Unlock full candidate profile",
        description:
          "See real names, photos, contact details, and bios. Starter also includes instant job approval and direct messaging.",
        tier,
        price,
        tierLabel,
      };
    case "messaging":
      return {
        title: "Unlock direct messaging",
        description:
          "Message candidates in real time and close hires without leaving Replaceme.",
        tier,
        price,
        tierLabel,
      };
    case "resume":
      return {
        title: "Unlock resume downloads",
        description:
          "Download full resumes for shortlisted candidates and share them with your hiring team.",
        tier,
        price,
        tierLabel,
      };
    case "job_limit":
      return {
        title: "Post more active jobs",
        description:
          "You've reached your active job limit. Upgrade for additional listings and faster approval.",
        tier,
        price,
        tierLabel,
      };
    case "applicant_cap":
      return {
        title: "Raise your applicant cap",
        description:
          "This job is nearing its applicant limit. Upgrade to review more candidates per role.",
        tier,
        price,
        tierLabel,
      };
    case "priority_listing":
      return {
        title: "Get priority listing",
        description:
          "Growth and Scale plans surface your jobs higher in search results to attract top talent faster.",
        tier,
        price,
        tierLabel,
      };
    case "priority_support":
      return {
        title: "Upgrade to Scale",
        description:
          "Unlimited jobs and applicants, plus priority support for teams managing active contracts and payroll.",
        tier: "scale",
        price: TIER_PRICES.scale,
        tierLabel: TIER_LABELS.scale,
      };
    case "early_access":
      return {
        title: "Early Access on Scale",
        description:
          "Try new hiring features first with Scale: Early Access to New Features. Upgrade to unlock, or wait until they roll out to all plans.",
        tier: "scale",
        price: TIER_PRICES.scale,
        tierLabel: TIER_LABELS.scale,
      };
    default:
      return {
        title: "Upgrade your plan",
        description: "Unlock more hiring tools with a paid subscription.",
        tier,
        price,
        tierLabel,
      };
  }
}

export function previewDisplayName(candidateId: string): string {
  const idClean = candidateId.replace(/[^0-9]/g, "");
  const appCode = idClean.length >= 3 ? idClean.substring(0, 3) : "402";
  return `Applicant #${appCode}`;
}

export function planDashboardSubhead(
  planSlug: string,
  activeJobsCount: number,
  activeJobsLimit: number | null,
  identityMode: string
): string {
  const tier = TIER_LABELS[normalizePlanSlug(planSlug)];
  const jobsPart =
    activeJobsLimit === null
      ? `${activeJobsCount} active jobs`
      : `${activeJobsCount} of ${activeJobsLimit} active jobs`;

  if (normalizePlanSlug(planSlug) === "discovery") {
    return `${tier} plan: ${jobsPart}. Candidate profiles are in preview mode until you upgrade.`;
  }

  if (identityMode === "anonymous_preview") {
    return `${tier} plan: ${jobsPart}. Upgrade for full candidate profiles and messaging.`;
  }

  return `${tier} plan: ${jobsPart}. Manage listings and review applicants below.`;
}

export function pinnedPageSubhead(
  planSlug: string,
  pinnedCount: number,
  identityMode: string
): string {
  const tier = TIER_LABELS[normalizePlanSlug(planSlug)];
  const countLabel =
    pinnedCount === 1 ? "1 pinned worker" : `${pinnedCount} pinned workers`;

  if (identityMode === "anonymous_preview") {
    return `${tier} plan: ${countLabel}. Profiles show preview names until you upgrade.`;
  }

  return `${tier} plan: ${countLabel}. Compare bookmarked talent and message from one place.`;
}
