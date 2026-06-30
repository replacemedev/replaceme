"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  patchWorkerProfileSchema,
  updateWorkerSkillSchema,
  workerSkillInputSchema,
  workerProjectInputSchema,
  updateWorkerProjectSchema,
  type PatchWorkerProfileInput,
} from "@/lib/validations/worker/profile-inline";
import { updateWorkerSettingsSchema } from "@/lib/validations/worker/phase2";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateWorkerCache,
  invalidateEmployerCachesForWorker,
} from "@/lib/server/redis-cache";
import { emitWorkerAuditLog } from "@/lib/server/audit/worker-events";
import { rateLimitAvatarUpload } from "@/lib/server/rate-limit";

function emptyToNull(value: string | undefined) {
  if (value === undefined) return undefined;
  return value.trim() === "" ? null : value;
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export async function patchWorkerProfile(payload: PatchWorkerProfileInput) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = patchWorkerProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
  }

  const data = parsed.data;
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.firstName !== undefined) update.first_name = data.firstName;
  if (data.lastName !== undefined) update.last_name = data.lastName;
  if (data.professionalTitle !== undefined) {
    update.professional_title = data.professionalTitle;
  }
  if (data.bio !== undefined) update.bio = data.bio || null;
  if (data.location !== undefined) update.location = data.location || null;
  if (data.portfolioUrl !== undefined) {
    update.portfolio_url = emptyToNull(data.portfolioUrl);
  }
  if (data.resumeUrl !== undefined) update.resume_url = emptyToNull(data.resumeUrl);
  if (data.cvUrl !== undefined) update.cv_url = emptyToNull(data.cvUrl);
  if (data.avatarUrl !== undefined) update.avatar_url = emptyToNull(data.avatarUrl);
  if (data.birthYear !== undefined) update.birth_year = data.birthYear;

  const { error } = await ctx.supabase
    .from("profiles")
    .update(update)
    .eq("id", ctx.profile.id);

  if (error) return { error: `Failed to update profile: ${error.message}` };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  await emitWorkerAuditLog(ctx.profile.id, "worker.profile_updated");
  revalidatePath("/worker/profile");
  return { success: true };
}

/** @deprecated Use patchWorkerProfile from inline profile editor */
export async function updateWorkerProfile(payload: PatchWorkerProfileInput) {
  return patchWorkerProfile(payload);
}

export async function uploadWorkerAvatar(formData: FormData) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const rate = await rateLimitAvatarUpload(ctx.profile.id);
  if (!rate.success) return { error: rate.error };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "File must be 2 MB or smaller." };
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    return { error: "Use JPEG or PNG files only." };
  }

  const extension =
    file.name.includes(".") ? file.name.split(".").pop() : file.type === "image/png" ? "png" : "jpg";
  const storagePath = `${ctx.profile.id}/avatar.${extension}`;

  const fileBuffer = await file.arrayBuffer();
  const { error: uploadError } = await ctx.supabase.storage
    .from("profile-avatars")
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) return { error: "Failed to upload avatar." };

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-avatars/${storagePath}`;

  const { error: updateError } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", ctx.profile.id);

  if (updateError) return { error: "Failed to save avatar." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  await emitWorkerAuditLog(ctx.profile.id, "worker.profile_updated");
  revalidatePath("/worker/profile");
  revalidatePath("/worker/onboarding");
  revalidatePath("/worker/dashboard");

  return { success: true, avatarUrl: publicUrl };
}

export async function removeWorkerAvatar() {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const rate = await rateLimitAvatarUpload(ctx.profile.id);
  if (!rate.success) return { error: rate.error };

  const { data: row } = await ctx.supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", ctx.profile.id)
    .single();

  const url = row?.avatar_url ?? null;
  if (!url) return { success: true };

  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-avatars/`;
  if (!url.startsWith(prefix)) {
    // Only allow removal for avatars we control in our bucket.
    return { error: "Avatar cannot be removed." };
  }

  const storagePath = url.slice(prefix.length);

  await ctx.supabase.storage.from("profile-avatars").remove([storagePath]);

  const { error: updateError } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", ctx.profile.id);

  if (updateError) return { error: "Failed to remove avatar." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  await emitWorkerAuditLog(ctx.profile.id, "worker.profile_updated");
  revalidatePath("/worker/profile");
  revalidatePath("/worker/onboarding");
  revalidatePath("/worker/dashboard");

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
      ...(parsed.data.salaryCurrency
        ? { salary_currency: parsed.data.salaryCurrency }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id);

  if (error) return { error: "Failed to update settings" };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  await emitWorkerAuditLog(ctx.profile.id, "worker.settings_updated");
  revalidatePath("/worker/settings");
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function createWorkerSkill(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = workerSkillInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid skill" };
  }

  const { data, error } = await ctx.supabase.from("worker_skills").insert({
    worker_id: ctx.profile.id,
    skill_name: parsed.data.skillName,
    proficiency: parsed.data.proficiency,
    proficiency_label: parsed.data.proficiencyLabel,
    category: parsed.data.category ?? "top",
    experience_duration: parsed.data.experienceDuration ?? null,
    years_with_skill: parsed.data.yearsWithSkill ?? null,
  }).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "Skill already exists." };
    return { error: "Failed to add skill." };
  }

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true, id: data.id };
}

export async function updateWorkerSkill(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = updateWorkerSkillSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid skill" };
  }

  const { error } = await ctx.supabase
    .from("worker_skills")
    .update({
      skill_name: parsed.data.skillName,
      proficiency: parsed.data.proficiency,
      proficiency_label: parsed.data.proficiencyLabel,
      category: parsed.data.category ?? "top",
      experience_duration: parsed.data.experienceDuration ?? null,
      years_with_skill: parsed.data.yearsWithSkill ?? null,
    })
    .eq("id", parsed.data.id)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to update skill." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function deleteWorkerSkill(skillId: string) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase
    .from("worker_skills")
    .delete()
    .eq("id", skillId)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to delete skill." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function createWorkerProject(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = workerProjectInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid project" };
  }

  const { data, error } = await ctx.supabase.from("worker_projects").insert({
    worker_id: ctx.profile.id,
    title: parsed.data.title,
    role: parsed.data.role,
    year: parsed.data.year,
    description: parsed.data.description,
    skills_used: parsed.data.skillsUsed,
  }).select("id").single();

  if (error) return { error: "Failed to add project." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true, id: data.id };
}

export async function updateWorkerProject(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = updateWorkerProjectSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid project" };
  }

  const { error } = await ctx.supabase
    .from("worker_projects")
    .update({
      title: parsed.data.title,
      role: parsed.data.role,
      year: parsed.data.year,
      description: parsed.data.description,
      skills_used: parsed.data.skillsUsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to update project." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function deleteWorkerProject(projectId: string) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase
    .from("worker_projects")
    .delete()
    .eq("id", projectId)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to delete project." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

export async function getWorkerProjects() {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("worker_projects")
    .select("id, title, role, year, description, skills_used")
    .eq("worker_id", ctx.profile.id)
    .order("year", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    role: row.role,
    year: row.year,
    description: row.description,
    skillsUsed: row.skills_used ?? [],
  }));
}
