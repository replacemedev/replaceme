export type SubscriptionTier =
  | "discovery"
  | "starter"
  | "growth"
  | "scale";

export interface AccountSettings {
  plan: SubscriptionTier;
  unlocksUsed: number;
  unlocksTotal: number;
  active: boolean;
  nextBillingDate: string | null;
  status: string;
  cancelAtPeriodEnd: boolean;
  hasStripeSubscription: boolean;
}

export interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  price: number;
  features: string[];
  ctaText: string;
  ctaStyle: "primary" | "secondary" | "accent";
  popular: boolean;
  limits: {
    jobs: string;
    applicants: string;
    approval: string;
    messaging: string;
    resumeDownload: string;
    viewIdentities: string;
    priorityListing: string;
    prioritySupport: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string | null;
}
