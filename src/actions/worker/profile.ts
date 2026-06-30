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
import { safeError } from "@/utils/logger";
import { createAdminClient } from "@/lib/supabase/server";
import {
  PROFILE_IMAGE_MAX_BYTES,
  mapProfileImageUploadError,
  profileImageMaxMbLabel,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";

const PROFILE_AVATAR_BUCKET = "profile-avatars";

function emptyToNull(value: string | undefined) {
  if (value === undefined) return undefined;
  return value.trim() === "" ? null : value;
}

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

export async function uploadWorkerAvatar(formData: FormData) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file was uploaded." };
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return { error: `File exceeds ${profileImageMaxMbLabel()} maximum.` };
  }

  const mimeType = resolveProfileImageMime(file);
  if (!mimeType) {
    return { error: "Only JPG and PNG files are allowed." };
  }

  const extension = mimeType === "image/png" ? "png" : "jpg";
  const altExtension = extension === "png" ? "jpg" : "png";
  const storagePath = `${ctx.user.id}/avatar.${extension}`;
  const altStoragePath = `${ctx.user.id}/avatar.${altExtension}`;
  const fileBuffer = await file.arrayBuffer();

  if (fileBuffer.byteLength === 0) {
    return { error: "Uploaded file is empty. Please choose a different image." };
  }

  const { data: existingFiles } = await ctx.supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .list(ctx.user.id, { limit: 20 });

  const pathsToRemove = [
    storagePath,
    altStoragePath,
    ...(existingFiles ?? [])
      .filter((entry) => entry.name.startsWith("avatar."))
      .map((entry) => `${ctx.user.id}/${entry.name}`),
  ];

  const admin = await createAdminClient();
  const uniquePaths = [...new Set(pathsToRemove)];

  const { error: removeError } = await admin.storage
    .from(PROFILE_AVATAR_BUCKET)
    .remove(uniquePaths);

  if (removeError) {
    safeError("uploadWorkerAvatar remove:", removeError);
  }

  const { error: uploadError } = await admin.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(storagePath, new Uint8Array(fileBuffer), {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    safeError("uploadWorkerAvatar storage:", uploadError);
    return { error: mapProfileImageUploadError(uploadError.message, "avatar") };
  }

  const { data: publicUrlData } = ctx.supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(storagePath);

  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { data: updatedRow, error: updateError } = await ctx.supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedRow) {
    safeError("uploadWorkerAvatar profile update:", updateError ?? "no row updated");
    await admin.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);
    return {
      error:
        "Your photo uploaded but we couldn't link it to your profile. Please try again.",
    };
  }

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/onboarding");
  revalidatePath("/", "layout");

  return { success: true, avatarUrl };
}

export async function removeWorkerAvatar() {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", ctx.profile.id)
    .single();

  if (profile?.avatar_url) {
    const marker = `/object/public/${PROFILE_AVATAR_BUCKET}/`;
    const pathStart = profile.avatar_url.indexOf(marker);
    if (pathStart !== -1) {
      const rawPath = profile.avatar_url.slice(pathStart + marker.length);
      const storagePath = rawPath.split("?")[0];
      const admin = await createAdminClient();
      await admin.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);
    }
  }

  const { data: updatedRow, error } = await ctx.supabase
    .from("profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedRow) return { error: "Failed to remove profile photo." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/onboarding");
  revalidatePath("/", "layout");

  return { success: true };
}
