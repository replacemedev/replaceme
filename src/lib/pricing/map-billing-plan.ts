import type { Database } from "@/types/database";
import type { PricingPlan } from "@/types/employer/billing";

export type BillingPlanRow = Pick<
  Database["public"]["Tables"]["billing_plans"]["Row"],
  | "id"
  | "name"
  | "slug"
  | "price"
  | "job_post_limit"
  | "applicants_per_job_limit"
  | "approval_mode"
  | "messaging_enabled"
  | "resume_download_enabled"
  | "identity_mode"
  | "priority_listing"
  | "priority_support"
  | "early_access"
  | "is_popular"
>;

function planSlug(plan: BillingPlanRow): string {
  return (plan.slug ?? plan.name).toLowerCase();
}

function formatJobLimit(limit: number | null): string {
  if (limit === null) return "Unlimited Active Job Posts";
  if (limit === 1) return "1 Active Job Post";
  return `${limit} Active Job Posts`;
}

function formatApplicantLimit(limit: number | null): string {
  if (limit === null) return "Unlimited Applicants per Job";
  return `Up to ${limit} Applicants per Job`;
}

function buildFeatures(plan: BillingPlanRow): string[] {
  const slug = planSlug(plan);
  const features: string[] = [
    formatJobLimit(plan.job_post_limit),
    formatApplicantLimit(plan.applicants_per_job_limit),
  ];

  if (plan.approval_mode === "queued_2d") {
    features.push("2-Day Job Approval");
    features.push("Anonymous Candidate Previews");
  } else {
    features.push("Instant Job Approval");
  }

  if (plan.identity_mode === "full") {
    features.push("Full Candidate Profiles");
  }

  if (plan.resume_download_enabled) {
    features.push("Resume Downloads");
  } else {
    features.push("No Resume Downloads");
  }

  if (plan.messaging_enabled) {
    features.push("Direct Messaging");
  } else {
    features.push("No Messaging");
  }

  if (slug === "starter") features.push("Email Support");
  if (plan.priority_listing) features.push("Priority Listing");
  if (plan.priority_support) features.push("Priority Support");
  if (plan.early_access) features.push("Early Access");

  return features;
}

function ctaForSlug(slug: string): { ctaText: string; ctaStyle: PricingPlan["ctaStyle"] } {
  switch (slug) {
    case "discovery":
      return { ctaText: "Post a Job for Free", ctaStyle: "secondary" };
    case "starter":
      return { ctaText: "Start Hiring", ctaStyle: "primary" };
    case "growth":
      return { ctaText: "Grow Your Team", ctaStyle: "accent" };
    case "scale":
      return { ctaText: "Scale Your Team", ctaStyle: "secondary" };
    default:
      return { ctaText: "Get Started", ctaStyle: "secondary" };
  }
}

export function mapBillingPlanToPricingPlan(plan: BillingPlanRow): PricingPlan {
  const slug = planSlug(plan);
  const { ctaText, ctaStyle } = ctaForSlug(slug);

  return {
    id: plan.id,
    slug,
    name: plan.name,
    price: Number(plan.price),
    features: buildFeatures(plan),
    ctaText,
    ctaStyle,
    popular: plan.is_popular,
    limits: {
      jobs:
        plan.job_post_limit === null ? "Unlimited" : String(plan.job_post_limit),
      applicants:
        plan.applicants_per_job_limit === null
          ? "Unlimited"
          : String(plan.applicants_per_job_limit),
      approval: plan.approval_mode === "queued_2d" ? "2-Day" : "Instant",
      messaging: plan.messaging_enabled ? "Yes" : "No",
      resumeDownload: plan.resume_download_enabled ? "Yes" : "No",
      viewIdentities: plan.identity_mode === "full" ? "Full" : "Preview",
      priorityListing: plan.priority_listing ? "Yes" : "No",
      prioritySupport: plan.priority_support ? "Yes" : "No",
    },
  };
}
