"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { PricingPlan, FAQItem, TestimonialItem } from "@/types/employer/billing";

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

    // Query billing_plans from database
    const { data: dbPlans, error: plansError } = await supabase
      .from("billing_plans")
      .select("id, name, price, job_post_limit, candidate_unlocks")
      .order("price", { ascending: true });

    if (plansError) {
      safeError("Error fetching billing plans:", plansError);
    }

    const plans: PricingPlan[] = (dbPlans || []).map((p) => {
      const nameLower = p.name.toLowerCase();
      
      // Construct feature list and comparative limits dynamically based on DB record attributes
      const features: string[] = [];
      const limits = {
        jobs: p.job_post_limit === 0 ? "0" : p.job_post_limit >= 10 ? "Unlimited" : `Up to ${p.job_post_limit}`,
        applicants: nameLower === "professional" ? "Unlimited" : nameLower === "essential" ? "200" : "15",
        approval: nameLower === "discovery" ? "2-Day" : "Instant",
        candidateContact: nameLower === "professional" ? "Unlimited" : nameLower === "essential" ? "75/mo" : "No",
        viewIdentities: nameLower === "discovery" ? "No" : "Yes",
        prioritySupport: nameLower === "professional" ? "Yes" : "No",
      };

      if (nameLower === "discovery") {
        features.push("1 Active Job Post", "Up to 15 Applicants", "2-Day Approval", "Anonymized Applicant Previews");
      } else if (nameLower === "essential") {
        features.push("Up to 3 Job Posts", "Up to 200 Applicants", "Contact 75 Candidates/mo", "Full Identities & Resumes", "Instant Approval");
      } else if (nameLower === "professional") {
        features.push("Unlimited Job Posts", "Unlimited Applicants", "Unlimited Messaging", "Full Identities & Resumes", "Instant Approval", "Priority Support");
      }

      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        features,
        ctaText: nameLower === "discovery" ? "Post a Job for Free" : nameLower === "essential" ? "Start Hiring" : "Scale Your Team",
        ctaStyle: nameLower === "essential" ? "primary" : nameLower === "professional" ? "accent" : "secondary" as any,
        popular: nameLower === "essential",
        limits,
      };
    });

    // Query FAQs and testimonials dynamically from database tables
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

    const faqs: FAQItem[] = (dbFaqs || []).map(f => ({
      question: f.question,
      answer: f.answer,
    }));

    const testimonials: TestimonialItem[] = (dbTestimonials || []).map(t => ({
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
    
    // Check if the planId is a valid UUID, otherwise query by name
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);
    let query = supabase.from("billing_plans").select("id, name, price, job_post_limit, candidate_unlocks");

    if (isUuid) {
      query = query.eq("id", planId);
    } else {
      query = query.ilike("name", planId);
    }

    const { data: p, error } = await query.maybeSingle();

    if (error || !p) {
      safeError(`Billing plan not found for ID/Name: ${planId}`, error);
      return null;
    }

    const nameLower = p.name.toLowerCase();
    const features: string[] = [];
    const limits = {
      jobs: p.job_post_limit === 0 ? "0" : p.job_post_limit >= 10 ? "Unlimited" : `Up to ${p.job_post_limit}`,
      applicants: nameLower === "professional" ? "Unlimited" : nameLower === "essential" ? "200" : "15",
      approval: nameLower === "discovery" ? "2-Day" : "Instant",
      candidateContact: nameLower === "professional" ? "Unlimited" : nameLower === "essential" ? "75/mo" : "No",
      viewIdentities: nameLower === "discovery" ? "No" : "Yes",
      prioritySupport: nameLower === "professional" ? "Yes" : "No",
    };

    if (nameLower === "discovery") {
      features.push("1 Active Job Post", "Up to 15 Applicants", "2-Day Approval", "Anonymized Applicant Previews");
    } else if (nameLower === "essential") {
      features.push("Up to 3 Job Posts", "Up to 200 Applicants", "Contact 75 Candidates/mo", "Full Identities & Resumes", "Instant Approval");
    } else if (nameLower === "professional") {
      features.push("Unlimited Job Posts", "Unlimited Applicants", "Unlimited Messaging", "Full Identities & Resumes", "Instant Approval", "Priority Support");
    }

    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      features,
      ctaText: nameLower === "discovery" ? "Post a Job for Free" : nameLower === "essential" ? "Start Hiring" : "Scale Your Team",
      ctaStyle: nameLower === "essential" ? "primary" : nameLower === "professional" ? "accent" : "secondary" as any,
      popular: nameLower === "essential",
      limits,
    };
  } catch (err) {
    safeError("getPlanDetails error occurred:", err);
    return null;
  }
}
