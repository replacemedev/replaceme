export type SubscriptionTier = "discovery" | "essential" | "professional";

export interface AccountSettings {
  plan: SubscriptionTier;
  unlocksUsed: number;
  unlocksTotal: number;
  active: boolean;
  nextBillingDate: string | null;
  status: string;
}

export interface PricingPlan {
  id: string;
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
    candidateContact: string;
    viewIdentities: string;
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
