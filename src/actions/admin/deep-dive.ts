"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { safeError } from "@/utils/logger";
import { parseJobDescription } from "@/types/job-details";

export type AdminJobDeepDive = {
  id: string;
  title: string;
  status: string;
  employerId: string;
  companyName: string | null;
  employmentType: string;
  location: string | null;
  monthlySalary: number;
  salaryCurrency: string;
  hoursPerWeek: number;
  skills: string[];
  description: string;
  parsedSections: ReturnType<typeof parseJobDescription>;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminJobDeepDive(jobId: string): Promise<AdminJobDeepDive | null> {
  try {
    const id = z.string().uuid().parse(jobId);
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        status,
        employer_id,
        employment_type,
        description,
        monthly_salary,
        salary_currency,
        hours_per_week,
        skills,
        location,
        created_at,
        updated_at,
        profiles!jobs_employer_id_fkey (
          company_profiles (
            company_name
          )
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data?.id) return null;

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const companyProfiles = profile?.company_profiles;
    const company = Array.isArray(companyProfiles) ? companyProfiles[0] : companyProfiles;

    const description = data.description ?? "";
    return {
      id: data.id,
      title: data.title,
      status: data.status,
      employerId: data.employer_id,
      companyName: company?.company_name ?? null,
      employmentType: data.employment_type,
      location: data.location,
      monthlySalary: Number(data.monthly_salary ?? 0),
      salaryCurrency: data.salary_currency ?? "PHP",
      hoursPerWeek: Number(data.hours_per_week ?? 0),
      skills: (data.skills as string[]) ?? [],
      description,
      parsedSections: parseJobDescription(description),
      createdAt: data.created_at,
      updatedAt: data.updated_at ?? data.created_at,
    };
  } catch (err) {
    safeError("getAdminJobDeepDive:", err);
    return null;
  }
}

export type AdminEmployerDeepDive = {
  employerId: string;
  companyName: string;
  email: string | null;
  industry: string | null;
  websiteUrl: string | null;
  companyBio: string | null;
  accountStatus: string;
  createdAt: string;
  birthDate?: string | null;
  gender?: string | null;
  civilStatus?: string | null;
  phoneNumber?: string | null;
  tinNumber?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
  personalAddress?: string | null;
  personalCity?: string | null;
  personalStateProvince?: string | null;
  country?: string | null;
  subscription: {
    status: string;
    planSlug: string | null;
    planName: string | null;
    unitAmountCents: number | null;
    billingInterval: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
    lastPaymentStatus: string | null;
    lastPaymentAt: string | null;
    failedPaymentCount: number;
    jobPostsUsed: number;
    unlocksUsed: number;
  } | null;
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  recentLedger: Array<{
    id: string;
    eventType: string;
    amountCents: number;
    currency: string;
    occurredAt: string;
  }>;
};

export async function getAdminEmployerDeepDive(
  employerId: string
): Promise<AdminEmployerDeepDive | null> {
  try {
    const id = z.string().uuid().parse(employerId);
    const { supabase } = await requireAdmin();

    const [{ data: profile }, { data: company }, { data: subscription }, { data: jobs }, { data: ledger }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, account_status, created_at, role, birth_date, gender, civil_status, phone_number, tin_number, id_type, id_number, id_expiration_date, id_issuing_country, personal_address, personal_city, personal_state_province, country")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("company_profiles")
          .select("company_name, industry, website_url, company_bio, created_at")
          .eq("employer_id", id)
          .maybeSingle(),
        supabase
          .from("employer_subscriptions")
          .select(
            `
            status,
            plan_slug,
            unit_amount_cents,
            billing_interval,
            stripe_customer_id,
            stripe_subscription_id,
            current_period_end,
            last_payment_status,
            last_payment_at,
            failed_payment_count,
            job_posts_used,
            unlocks_used,
            billing_plans!employer_subscriptions_plan_id_fkey (name)
          `
          )
          .eq("employer_id", id)
          .maybeSingle(),
        supabase
          .from("jobs")
          .select("id, title, status, created_at")
          .eq("employer_id", id)
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("billing_ledger_events")
          .select("id, event_type, amount_cents, currency, occurred_at")
          .eq("employer_id", id)
          .order("occurred_at", { ascending: false })
          .limit(8),
      ]);

    if (!profile?.id || profile.role !== "employer") return null;

    const plan = Array.isArray(subscription?.billing_plans)
      ? subscription.billing_plans[0]
      : subscription?.billing_plans;

    return {
      employerId: profile.id,
      companyName: company?.company_name ?? "Unnamed company",
      email: profile.email,
      industry: company?.industry ?? null,
      websiteUrl: company?.website_url ?? null,
      companyBio: company?.company_bio ?? null,
      accountStatus: profile.account_status,
      createdAt: company?.created_at ?? profile.created_at,
      birthDate: profile.birth_date,
      gender: profile.gender,
      civilStatus: profile.civil_status,
      phoneNumber: profile.phone_number,
      tinNumber: profile.tin_number,
      idType: profile.id_type,
      idNumber: profile.id_number,
      idExpirationDate: profile.id_expiration_date,
      idIssuingCountry: profile.id_issuing_country,
      personalAddress: profile.personal_address,
      personalCity: profile.personal_city,
      personalStateProvince: profile.personal_state_province,
      country: profile.country,
      subscription: subscription
        ? {
            status: subscription.status,
            planSlug: subscription.plan_slug,
            planName: plan?.name ?? null,
            unitAmountCents: subscription.unit_amount_cents,
            billingInterval: subscription.billing_interval,
            stripeCustomerId: subscription.stripe_customer_id,
            stripeSubscriptionId: subscription.stripe_subscription_id,
            currentPeriodEnd: subscription.current_period_end,
            lastPaymentStatus: subscription.last_payment_status,
            lastPaymentAt: subscription.last_payment_at,
            failedPaymentCount: subscription.failed_payment_count ?? 0,
            jobPostsUsed: subscription.job_posts_used,
            unlocksUsed: subscription.unlocks_used,
          }
        : null,
      jobs: (jobs ?? []).map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.created_at,
      })),
      recentLedger: (ledger ?? []).map((row) => ({
        id: row.id,
        eventType: row.event_type,
        amountCents: row.amount_cents,
        currency: row.currency,
        occurredAt: row.occurred_at,
      })),
    };
  } catch (err) {
    safeError("getAdminEmployerDeepDive:", err);
    return null;
  }
}

export type AdminWorkerProfileDeepDive = {
  id: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  professionalTitle: string | null;
  bio: string | null;
  birthDate: string | null;
  location: string | null;
  region: string | null;
  province: string | null;
  city: string | null;
  addressLine1: string | null;
  availability: string | null;
  isRemote: boolean | null;
  hourlyRate: number | null;
  salaryCurrency: string;
  accountStatus: string;
  verificationStatus: string | null;
  suffix?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  civilStatus?: string | null;
  preferredLanguage?: string | null;
  tinNumber?: string | null;
  sssNumber?: string | null;
  philhealthNumber?: string | null;
  pagibigNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
  skills: Array<{
    skillName: string;
    proficiency: number;
    proficiencyLabel: string | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    role: string;
    year: number;
    description: string;
    skillsUsed: string[];
  }>;
  createdAt: string;
};

export async function getAdminWorkerProfileDeepDive(
  workerId: string
): Promise<AdminWorkerProfileDeepDive | null> {
  try {
    const id = z.string().uuid().parse(workerId);
    const { supabase } = await requireAdmin();

    const [{ data: profile }, { data: skills }, { data: projects }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, first_name, middle_name, last_name, username, suffix, phone_number, gender, civil_status, preferred_language, tin_number, sss_number, philhealth_number, pagibig_number, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, id_type, id_number, id_expiration_date, id_issuing_country, email, professional_title, bio, birth_date, location, region, province, city, address_line_1, availability, is_remote, hourly_rate, salary_currency, created_at, role, account_status, verification_status"
          )
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("worker_skills")
          .select("skill_name, proficiency, proficiency_label")
          .eq("worker_id", id)
          .order("proficiency", { ascending: false })
          .limit(12),
        supabase
          .from("worker_projects")
          .select("id, title, role, year, description, skills_used")
          .eq("worker_id", id)
          .order("year", { ascending: false })
          .limit(6),
      ]);

    if (!profile?.id || profile.role !== "worker") return null;

    return {
      id: profile.id,
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      username: profile.username ?? null,
      email: profile.email,
      professionalTitle: profile.professional_title,
      bio: profile.bio,
      birthDate: profile.birth_date,
      location: profile.location,
      region: profile.region,
      province: profile.province,
      city: profile.city,
      addressLine1: profile.address_line_1,
      availability: profile.availability,
      isRemote: profile.is_remote,
      hourlyRate: profile.hourly_rate,
      salaryCurrency: profile.salary_currency ?? "PHP",
      accountStatus: profile.account_status,
      verificationStatus: profile.verification_status ?? null,
      suffix: profile.suffix,
      phoneNumber: profile.phone_number,
      gender: profile.gender,
      civilStatus: profile.civil_status,
      preferredLanguage: profile.preferred_language,
      tinNumber: profile.tin_number,
      sssNumber: profile.sss_number,
      philhealthNumber: profile.philhealth_number,
      pagibigNumber: profile.pagibig_number,
      emergencyContactName: profile.emergency_contact_name,
      emergencyContactRelationship: profile.emergency_contact_relationship,
      emergencyContactPhone: profile.emergency_contact_phone,
      idType: profile.id_type,
      idNumber: profile.id_number,
      idExpirationDate: profile.id_expiration_date,
      idIssuingCountry: profile.id_issuing_country,
      skills: (skills ?? []).map((s) => ({
        skillName: s.skill_name,
        proficiency: s.proficiency,
        proficiencyLabel: s.proficiency_label ?? null,
      })),
      projects: (projects ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        role: p.role,
        year: p.year,
        description: p.description,
        skillsUsed: p.skills_used ?? [],
      })),
      createdAt: profile.created_at,
    };
  } catch (err) {
    safeError("getAdminWorkerProfileDeepDive:", err);
    return null;
  }
}

