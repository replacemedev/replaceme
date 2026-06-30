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

export type AdminWorkerProfileDeepDive = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  professionalTitle: string | null;
  bio: string | null;
  birthYear: number | null;
  location: string | null;
  availability: string | null;
  isRemote: boolean | null;
  hourlyRate: number | null;
  salaryCurrency: string;
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
            "id, first_name, last_name, email, professional_title, bio, birth_year, location, availability, is_remote, hourly_rate, salary_currency, created_at, role"
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
      lastName: profile.last_name,
      email: profile.email,
      professionalTitle: profile.professional_title,
      bio: profile.bio,
      birthYear: profile.birth_year,
      location: profile.location,
      availability: profile.availability,
      isRemote: profile.is_remote,
      hourlyRate: profile.hourly_rate,
      salaryCurrency: profile.salary_currency ?? "PHP",
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

