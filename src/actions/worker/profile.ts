"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  updateWorkerProfileSchema,
  updateWorkerSettingsSchema,
  type UpdateWorkerProfileInput,
} from "@/lib/validations/worker/phase2";

export async function getWorkerProfileForEdit() {
  const ctx = await requireWorker();
  if (!ctx) return null;

  const { data } = await ctx.supabase
    .from("profiles")
    .select(
      "first_name, last_name, professional_title, bio, location, portfolio_url, resume_url, cv_url, availability, hourly_rate, is_remote"
    )
    .eq("id", ctx.profile.id)
    .single();

  return data;
}

export async function updateWorkerProfile(payload: UpdateWorkerProfileInput) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = updateWorkerProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      professional_title: parsed.data.professionalTitle,
      bio: parsed.data.bio ?? null,
      location: parsed.data.location ?? null,
      portfolio_url: parsed.data.portfolioUrl || null,
      resume_url: parsed.data.resumeUrl || null,
      cv_url: parsed.data.cvUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id);

  if (error) return { error: `Failed to update profile: ${error.message}` };

  revalidatePath("/worker/profile");
  revalidatePath("/worker/profile/edit");
  return { success: true };
}

export async function updateWorkerSettings(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = updateWorkerSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      availability: parsed.data.availability,
      hourly_rate: parsed.data.hourlyRate,
      is_remote: parsed.data.isRemote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id);

  if (error) return { error: "Failed to update settings" };

  revalidatePath("/worker/settings");
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function getWorkerProjects() {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("worker_projects")
    .select("id, title, role, year, description")
    .eq("worker_id", ctx.profile.id)
    .order("year", { ascending: false });

  return data ?? [];
}

export async function addWorkerProject(payload: {
  title: string;
  role: string;
  year: number;
  description: string;
}) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase.from("worker_projects").insert({
    worker_id: ctx.profile.id,
    title: payload.title,
    role: payload.role,
    year: payload.year,
    description: payload.description,
  });

  if (error) return { error: "Failed to add project" };

  revalidatePath("/worker/profile/edit");
  return { success: true };
}
