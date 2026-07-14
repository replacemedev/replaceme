"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { PricingPlan, FAQItem, TestimonialItem } from "@/types/employer/billing";
import {
  mapBillingPlanToPricingPlan,
  type BillingPlanRow,
} from "@/lib/pricing/map-billing-plan";

const PLAN_SELECT =
  "id, name, slug, price, job_post_limit, applicants_per_job_limit, approval_mode, messaging_enabled, resume_download_enabled, identity_mode, priority_listing, priority_support, early_access, is_popular, display_order";

/**
 * Fetch dynamic pricing tiers from the database, and testimonials/FAQs.
 * Adheres to absolute zero mock data policy.
 */
export async function getPricingData(): Promise<{
  plans: PricingPlan[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
}> {
  try {
    const supabase = await createClient();

    const { data: dbPlans, error: plansError } = await supabase
      .from("billing_plans")
      .select(PLAN_SELECT)
      .order("display_order", { ascending: true });

    if (plansError) {
      safeError("Error fetching billing plans:", plansError);
    }

    const plans: PricingPlan[] = (dbPlans ?? []).map((p) =>
      mapBillingPlanToPricingPlan(p as BillingPlanRow)
    );

    const { data: dbFaqs, error: faqsError } = await supabase
      .from("faqs")
      .select("question, answer")
      .order("display_order", { ascending: true });

    if (faqsError) {
      safeError("Error fetching FAQs:", faqsError);
    }

    const { data: dbTestimonials, error: testimonialsError } = await supabase
      .from("testimonials")
      .select("quote, author_name, author_title, author_company, avatar_url")
      .order("display_order", { ascending: true });

    if (testimonialsError) {
      safeError("Error fetching testimonials:", testimonialsError);
    }

    const faqs: FAQItem[] = (dbFaqs || []).map((f) => ({
      question: f.question,
      answer: f.answer,
    }));

    const testimonials: TestimonialItem[] = (dbTestimonials || []).map((t) => ({
      quote: t.quote,
      author: t.author_name,
      role: t.author_title,
      company: t.author_company,
      avatarUrl: t.avatar_url,
    }));

    return {
      plans,
      testimonials,
      faqs,
    };
  } catch (err) {
    safeError("getPricingData error occurred:", err);
    return { plans: [], testimonials: [], faqs: [] };
  }
}

/**
 * Fetch a single billing plan details securely from the database.
 */
export async function getPlanDetails(planId: string): Promise<PricingPlan | null> {
  try {
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      planId
    );
    let query = supabase.from("billing_plans").select(PLAN_SELECT);

    if (isUuid) {
      query = query.eq("id", planId);
    } else {
      const { escapePostgrestValue } = await import(
        "@/lib/security/postgrest-filter"
      );
      const slug = planId.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64);
      if (!slug) return null;
      query = query.or(
        `slug.eq.${escapePostgrestValue(slug)},name.ilike.${escapePostgrestValue(slug)}`
      );
    }

    const { data: p, error } = await query.maybeSingle();

    if (error || !p) {
      safeError(`Billing plan not found for ID/Name: ${planId}`, error);
      return null;
    }

    return mapBillingPlanToPricingPlan(p as BillingPlanRow);
  } catch (err) {
    safeError("getPlanDetails error occurred:", err);
    return null;
  }
}
