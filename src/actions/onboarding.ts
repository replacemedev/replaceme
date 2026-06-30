"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileIdFilter, resolveRoleFromUser } from "@/lib/auth/role";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import {
  employerCompanyStepSchema,
  employerDetailsStepSchema,
  employerHiringStepSchema,
  employerOnboardingSchema,
  EmployerOnboardingStep,
  workerAboutStepSchema,
  workerCompensationStepSchema,
  workerIdentityStepSchema,
  workerLocationStepSchema,
  workerOnboardingSchema,
  workerProjectStepSchema,
  workerSkillsStepSchema,
  WorkerOnboardingStep,
} from "@/lib/validations/onboarding";

export type OnboardingStatus = {
  complete: boolean;
  role: "worker" | "employer";
};

export type WorkerOnboardingDraft = {
  professionalTitle: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  location: string;
  availability: string;
  isRemote: boolean;
  skills: string[];
  hourlyRate: number | null;
  salaryCurrency: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  bio: string;
  birthYear: number | null;
};

export type EmployerOnboardingDraft = {
  companyName: string;
  industry: string;
  companySize: string;
  skills: string[];
  websiteUrl: string;
  companyBio: string;
  logoUrl: string | null;
};

async function syncOnboardingWorkerSkills(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workerId: string,
  skills: string[]
) {
  await supabase
    .from("worker_skills")
    .delete()
    .eq("worker_id", workerId)
    .eq("category", "top");

  if (skills.length === 0) return;

  const rows = skills.map((skillName, index) => ({
    worker_id: workerId,
    skill_name: skillName,
    proficiency: 75,
    proficiency_label: "Proficient",
    category: "top",
    display_order: index,
  }));

  const { error } = await supabase.from("worker_skills").insert(rows);
  if (error && error.code !== "23505") {
    throw new Error("Failed to sync worker skills.");
  }
}

export const getOnboardingStatus = cache(async (): Promise<OnboardingStatus | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, professional_title, skills, location, onboarding_completed_at"
    )
    .or(profileIdFilter(user.id))
    .maybeSingle();

  if (!profile) return null;

  const role = resolveRoleFromUser(user, profile.role);

  if (profile.onboarding_completed_at) {
    return { complete: true, role: role === "employer" ? "employer" : "worker" };
  }

  if (role === "worker") {
    const complete = Boolean(
      profile.professional_title?.trim() &&
        profile.location?.trim() &&
        profile.skills &&
        profile.skills.length > 0
    );
    return { complete, role: "worker" };
  }

  if (role === "employer") {
    const { data: company } = await supabase
      .from("company_profiles")
      .select("id, company_name, industry, company_size")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const complete = Boolean(
      company?.company_name?.trim() &&
        company?.industry?.trim() &&
        company?.company_size?.trim() &&
        profile.skills &&
        profile.skills.length > 0
    );
    return { complete, role: "employer" };
  }

  return null;
});

export async function getWorkerOnboardingDraft(): Promise<WorkerOnboardingDraft | null> {
  try {
    const { supabase, user } = await requireRole("worker");

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "professional_title, first_name, last_name, avatar_url, location, availability, is_remote, skills, hourly_rate, salary_currency, expected_salary_min, expected_salary_max, bio, birth_year"
      )
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      professionalTitle: profile.professional_title ?? "",
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      avatarUrl: profile.avatar_url ?? null,
      location: profile.location ?? "",
      availability: profile.availability ?? "Full-time",
      isRemote: profile.is_remote ?? false,
      skills: profile.skills ?? [],
      hourlyRate: profile.hourly_rate ?? null,
      salaryCurrency: profile.salary_currency ?? "PHP",
      expectedSalaryMin: profile.expected_salary_min ?? null,
      expectedSalaryMax: profile.expected_salary_max ?? null,
      bio: profile.bio ?? "",
      birthYear: profile.birth_year ?? null,
    };
  } catch {
    return null;
  }
}

export async function getEmployerOnboardingDraft(): Promise<EmployerOnboardingDraft | null> {
  try {
    const { supabase, user } = await requireRole("employer");

    const [{ data: profile }, { data: company }] = await Promise.all([
      supabase.from("profiles").select("skills").eq("id", user.id).single(),
      supabase
        .from("company_profiles")
        .select("company_name, industry, company_size, website_url, company_bio, logo_url")
        .eq("employer_id", user.id)
        .maybeSingle(),
    ]);

    return {
      companyName: company?.company_name ?? "",
      industry: company?.industry ?? "",
      companySize: company?.company_size ?? "",
      skills: profile?.skills ?? [],
      websiteUrl: company?.website_url ?? "",
      companyBio: company?.company_bio ?? "",
      logoUrl: company?.logo_url ?? null,
    };
  } catch {
    return null;
  }
}

export async function saveWorkerOnboardingStep(
  step: WorkerOnboardingStep,
  input: unknown
) {
  return runAction(`saveWorkerOnboardingStep:${step}`, async () => {
    const { supabase, user } = await requireRole("worker");
    const now = new Date().toISOString();

    switch (step) {
      case "identity": {
        const parsed = workerIdentityStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({
            professional_title: parsed.professionalTitle,
            first_name: parsed.firstName,
            last_name: parsed.lastName,
            updated_at: now,
          })
          .eq("id", user.id);
        if (error) return fail("Failed to save profile.");
        break;
      }
      case "location": {
        const parsed = workerLocationStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({
            location: parsed.location,
            availability: parsed.availability,
            is_remote: parsed.isRemote,
            updated_at: now,
          })
          .eq("id", user.id);
        if (error) return fail("Failed to save location.");
        break;
      }
      case "skills": {
        const parsed = workerSkillsStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({ skills: parsed.skills, updated_at: now })
          .eq("id", user.id);
        if (error) return fail("Failed to save skills.");
        try {
          await syncOnboardingWorkerSkills(supabase, user.id, parsed.skills);
        } catch {
          return fail("Failed to sync skills to your profile.");
        }
        break;
      }
      case "compensation": {
        const parsed = workerCompensationStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({
            hourly_rate: parsed.hourlyRate ?? null,
            salary_currency: parsed.salaryCurrency,
            expected_salary_min: parsed.expectedSalaryMin ?? null,
            expected_salary_max: parsed.expectedSalaryMax ?? null,
            updated_at: now,
          })
          .eq("id", user.id);
        if (error) return fail("Failed to save compensation.");
        break;
      }
      case "about": {
        const parsed = workerAboutStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({
            bio: parsed.bio?.trim() ? parsed.bio.trim() : null,
            birth_year: parsed.birthYear ?? null,
            updated_at: now,
          })
          .eq("id", user.id);
        if (error) return fail("Failed to save bio.");
        break;
      }
      case "project": {
        const parsed = workerProjectStepSchema.parse(input);
        const { error } = await supabase.from("worker_projects").insert({
          worker_id: user.id,
          title: parsed.title,
          role: parsed.role,
          year: parsed.year,
          description: parsed.description,
          skills_used: parsed.skillsUsed,
        });
        if (error) return fail("Failed to save project.");
        break;
      }
      default:
        return fail("Unknown onboarding step.");
    }

    revalidatePath("/worker/onboarding");
    revalidatePath("/worker/profile");
    return ok();
  });
}

export async function saveEmployerOnboardingStep(
  step: EmployerOnboardingStep,
  input: unknown
) {
  return runAction(`saveEmployerOnboardingStep:${step}`, async () => {
    const { supabase, user } = await requireRole("employer");
    const now = new Date().toISOString();

    switch (step) {
      case "company": {
        const parsed = employerCompanyStepSchema.parse(input);
        const companyPayload = {
          company_name: parsed.companyName,
          industry: parsed.industry,
          company_size: parsed.companySize,
          updated_at: now,
        };

        const { data: updated } = await supabase
          .from("company_profiles")
          .update(companyPayload)
          .eq("employer_id", user.id)
          .select("id")
          .maybeSingle();

        if (!updated) {
          const { error: insertError } = await supabase
            .from("company_profiles")
            .insert({ employer_id: user.id, ...companyPayload });
          if (insertError) return fail("Failed to save company profile.");
        }
        break;
      }
      case "hiring": {
        const parsed = employerHiringStepSchema.parse(input);
        const { error } = await supabase
          .from("profiles")
          .update({ skills: parsed.skills, updated_at: now })
          .eq("id", user.id);
        if (error) return fail("Failed to save hiring skills.");
        break;
      }
      case "details": {
        const parsed = employerDetailsStepSchema.parse(input);
        const { error } = await supabase
          .from("company_profiles")
          .update({
            website_url: parsed.websiteUrl?.trim() ? parsed.websiteUrl.trim() : null,
            company_bio: parsed.companyBio?.trim() ? parsed.companyBio.trim() : null,
            updated_at: now,
          })
          .eq("employer_id", user.id);
        if (error) return fail("Failed to save company details.");
        break;
      }
      default:
        return fail("Unknown onboarding step.");
    }

    revalidatePath("/employer/onboarding");
    return ok();
  });
}

export async function finishWorkerOnboarding() {
  return runAction("finishWorkerOnboarding", async () => {
    const { supabase, user } = await requireRole("worker");
    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return fail("Failed to complete onboarding.");

    revalidatePath("/worker");
    return ok();
  });
}

export async function finishEmployerOnboarding() {
  return runAction("finishEmployerOnboarding", async () => {
    const { supabase, user } = await requireRole("employer");
    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return fail("Failed to complete onboarding.");

    revalidatePath("/employer");
    return ok();
  });
}

/** @deprecated Legacy single-step submit */
export async function completeWorkerOnboarding(input: {
  professionalTitle: string;
  location: string;
  skills: string[];
  bio?: string;
}) {
  return runAction("completeWorkerOnboarding", async () => {
    const parsed = workerOnboardingSchema.parse(input);
    const { supabase, user } = await requireRole("worker");

    const { error } = await supabase
      .from("profiles")
      .update({
        professional_title: parsed.professionalTitle,
        location: parsed.location,
        skills: parsed.skills,
        bio: parsed.bio ?? null,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return fail("Failed to save profile.");

    try {
      await syncOnboardingWorkerSkills(supabase, user.id, parsed.skills);
    } catch {
      return fail("Failed to sync skills.");
    }

    revalidatePath("/worker");
    return ok();
  });
}

export async function completeEmployerOnboarding(input: {
  companyName: string;
  industry: string;
  companySize: string;
  skills: string[];
  websiteUrl?: string;
  companyBio?: string;
}) {
  return runAction("completeEmployerOnboarding", async () => {
    const parsed = employerOnboardingSchema.parse(input);
    const { supabase, user } = await requireRole("employer");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        skills: parsed.skills,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) return fail("Failed to save hiring skills.");

    const companyPayload = {
      company_name: parsed.companyName,
      industry: parsed.industry,
      company_size: parsed.companySize,
      website_url: parsed.websiteUrl || null,
      company_bio: parsed.companyBio ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedCompany, error: companyUpdateError } = await supabase
      .from("company_profiles")
      .update(companyPayload)
      .eq("employer_id", user.id)
      .select("id")
      .maybeSingle();

    if (companyUpdateError) return fail("Failed to save company profile.");

    if (!updatedCompany) {
      const { error: companyInsertError } = await supabase
        .from("company_profiles")
        .insert({
          employer_id: user.id,
          ...companyPayload,
        });

      if (companyInsertError) return fail("Failed to save company profile.");
    }

    revalidatePath("/employer");
    return ok();
  });
}

export async function requireOnboardingComplete(
  role: "worker" | "employer",
  currentPath: string
) {
  const status = await getOnboardingStatus();
  if (!status || status.role !== role || status.complete) return;

  const onboardingPath =
    role === "worker" ? "/worker/onboarding" : "/employer/onboarding";

  if (!currentPath.startsWith(onboardingPath)) {
    redirect(onboardingPath);
  }
}
