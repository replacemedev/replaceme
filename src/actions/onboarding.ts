"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileIdFilter, resolveRoleFromUser } from "@/lib/auth/role";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import {
  employerOnboardingSchema,
  workerOnboardingSchema,
} from "@/lib/validations/onboarding";

export type OnboardingStatus = {
  complete: boolean;
  role: "worker" | "employer";
};

export const getOnboardingStatus = cache(async (): Promise<OnboardingStatus | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, professional_title, skills, location")
    .or(profileIdFilter(user.id))
    .maybeSingle();

  if (!profile) return null;

  const role = resolveRoleFromUser(user, profile.role);

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

export async function completeWorkerOnboarding(input: {
  professionalTitle: string;
  location: string;
  skills: string[];
  bio?: string;
}) {
  return runAction("completeWorkerOnboarding", async () => {
    const parsed = workerOnboardingSchema.parse(input);
    const { supabase, profile } = await requireRole("worker");

    const { error } = await supabase
      .from("profiles")
      .update({
        professional_title: parsed.professionalTitle,
        location: parsed.location,
        skills: parsed.skills,
        bio: parsed.bio ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) return fail("Failed to save profile.");

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
    const { supabase, profile } = await requireRole("employer");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        skills: parsed.skills,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (profileError) return fail("Failed to save hiring skills.");

    const { error } = await supabase.from("company_profiles").upsert(
      {
        employer_id: profile.id,
        company_name: parsed.companyName,
        industry: parsed.industry,
        company_size: parsed.companySize,
        website_url: parsed.websiteUrl || null,
        company_bio: parsed.companyBio ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employer_id" }
    );

    if (error) return fail("Failed to save company profile.");

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
