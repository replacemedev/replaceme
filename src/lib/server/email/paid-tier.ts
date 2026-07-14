import type { EmailTierSlug } from "@/lib/server/email/mailer";

/** Paid employer plans that receive premium transactional email alerts. */
export const PAID_EMAIL_TIERS = new Set<EmailTierSlug>([
  "starter",
  "growth",
  "scale",
]);

export function normalizeEmailTierSlug(
  slug: string | null | undefined
): EmailTierSlug {
  const value = (slug ?? "discovery").toLowerCase();
  if (
    value === "starter" ||
    value === "growth" ||
    value === "scale" ||
    value === "discovery"
  ) {
    return value;
  }
  if (value === "free" || value === "essential" || value === "professional") {
    if (value === "essential") return "starter";
    if (value === "professional") return "growth";
    return "discovery";
  }
  return "discovery";
}

export function isPaidEmailTier(
  slug: EmailTierSlug
): slug is Exclude<EmailTierSlug, "discovery"> {
  return PAID_EMAIL_TIERS.has(slug);
}

export function paidPlanLabel(
  slug: Exclude<EmailTierSlug, "discovery">
): "Starter" | "Growth" | "Scale" {
  switch (slug) {
    case "starter":
      return "Starter";
    case "growth":
      return "Growth";
    case "scale":
      return "Scale";
  }
}
