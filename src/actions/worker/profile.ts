"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  patchWorkerProfileSchema,
  updateWorkerSkillSchema,
  workerSkillInputSchema,
  jobExperienceInputSchema,
  updateJobExperienceSchema,
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
import { formatLocation } from "@/utils/locationFormatter";
import { createAdminClient } from "@/lib/supabase/server";
import {
  PROFILE_IMAGE_MAX_BYTES,
  mapProfileImageUploadError,
  profileImageMaxMbLabel,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";
import {
  replaceStorageImage,
  storagePathFromPublicUrl,
} from "@/lib/storage/replace-storage-image";
import type { Database } from "@/types/database";

const PROFILE_AVATAR_BUCKET = "profile-avatars";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function emptyToNull(value: string | null | undefined) {
  if (value === null || value === undefined) return value;
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
  const update: ProfileUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (data.firstName !== undefined) update.first_name = data.firstName;
  if (data.middleName !== undefined) update.middle_name = emptyToNull(data.middleName);
  if (data.lastName !== undefined) update.last_name = data.lastName;
  if (data.suffix !== undefined) update.suffix = emptyToNull(data.suffix);
  if (data.professionalTitle !== undefined) {
    update.professional_title = data.professionalTitle;
  }
  if (data.bio !== undefined) update.bio = data.bio || null;
  if (
    data.region !== undefined ||
    data.province !== undefined ||
    data.city !== undefined ||
    data.addressLine1 !== undefined
  ) {
    const { data: current } = await ctx.supabase
      .from("profiles")
      .select("region, province, city, address_line_1")
      .eq("id", ctx.profile.id)
      .single();

    const r = data.region !== undefined ? data.region : (current?.region || "");
    const p = data.province !== undefined ? data.province : (current?.province || "");
    const c = data.city !== undefined ? data.city : (current?.city || "");
    const a = data.addressLine1 !== undefined ? data.addressLine1 : (current?.address_line_1 || "");

    update.region = r || null;
    update.province = p || null;
    update.city = c || null;
    update.address_line_1 = a || null;
    update.location = formatLocation(a, c, p, r) || null;
  }
  if (data.portfolioUrl !== undefined) {
    update.portfolio_url = emptyToNull(data.portfolioUrl);
  }
  if (data.resumeUrl !== undefined) update.resume_url = emptyToNull(data.resumeUrl);
  if (data.cvUrl !== undefined) update.cv_url = emptyToNull(data.cvUrl);
  if (data.birthDate !== undefined) update.birth_date = data.birthDate;
  if (data.gender !== undefined) update.gender = emptyToNull(data.gender);
  if (data.spokenLanguages !== undefined) update.spoken_languages = data.spokenLanguages;
  if (data.tinNumber !== undefined) update.tin_number = emptyToNull(data.tinNumber);
  if (data.idType !== undefined) update.id_type = emptyToNull(data.idType);
  if (data.idNumber !== undefined) update.id_number = emptyToNull(data.idNumber);
  if (data.idExpirationDate !== undefined) update.id_expiration_date = data.idExpirationDate || null;
  if (data.idIssuingCountry !== undefined) update.id_issuing_country = emptyToNull(data.idIssuingCountry);

  const { error } = await ctx.supabase
    .from("profiles")
    .update(update)
    .eq("id", ctx.profile.id);

  if (error) return { error: `Failed to update profile: ${error.message}` };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  await emitWorkerAuditLog(ctx.profile.id, "worker.profile_updated");
  revalidatePath("/worker/profile");

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

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

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

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

  if (error || !data?.id) {
    if (error?.code === "23505") return { error: "Skill already exists." };
    return { error: "Failed to add skill." };
  }

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");

  // Keep profiles.skills in sync for matching / strength scoring
  const { data: skillRows } = await ctx.supabase
    .from("worker_skills")
    .select("skill_name")
    .eq("worker_id", ctx.profile.id);
  const skillNames = [
    ...new Set((skillRows ?? []).map((s) => s.skill_name).filter(Boolean)),
  ];
  await ctx.supabase
    .from("profiles")
    .update({ skills: skillNames, updated_at: new Date().toISOString() })
    .eq("id", ctx.profile.id);

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

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

  const { data: skillRows } = await ctx.supabase
    .from("worker_skills")
    .select("skill_name")
    .eq("worker_id", ctx.profile.id);
  const skillNames = [
    ...new Set((skillRows ?? []).map((s) => s.skill_name).filter(Boolean)),
  ];
  await ctx.supabase
    .from("profiles")
    .update({ skills: skillNames, updated_at: new Date().toISOString() })
    .eq("id", ctx.profile.id);

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

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

  const { data: skillRows } = await ctx.supabase
    .from("worker_skills")
    .select("skill_name")
    .eq("worker_id", ctx.profile.id);
  const skillNames = [
    ...new Set((skillRows ?? []).map((s) => s.skill_name).filter(Boolean)),
  ];
  await ctx.supabase
    .from("profiles")
    .update({ skills: skillNames, updated_at: new Date().toISOString() })
    .eq("id", ctx.profile.id);

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

  return { success: true };
}

export async function createJobExperience(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = jobExperienceInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid experience" };
  }

  const { data, error } = await ctx.supabase.from("job_experiences").insert({
    worker_id: ctx.profile.id,
    company_name: parsed.data.companyName,
    role_title: parsed.data.roleTitle,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    description: parsed.data.description,
    skills_used: parsed.data.skillsUsed,
  }).select("id").single();

  if (error || !data?.id) return { error: "Failed to add job experience." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true, id: data.id };
}

/** @deprecated Use createJobExperience */
export async function createWorkerProject(payload: unknown) {
  return createJobExperience(payload);
}

export async function updateJobExperience(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = updateJobExperienceSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid experience" };
  }

  const { error } = await ctx.supabase
    .from("job_experiences")
    .update({
      company_name: parsed.data.companyName,
      role_title: parsed.data.roleTitle,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      description: parsed.data.description,
      skills_used: parsed.data.skillsUsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to update job experience." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

/** @deprecated Use updateJobExperience */
export async function updateWorkerProject(payload: unknown) {
  return updateJobExperience(payload);
}

export async function deleteJobExperience(experienceId: string) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase
    .from("job_experiences")
    .delete()
    .eq("id", experienceId)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to delete job experience." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  return { success: true };
}

/** @deprecated Use deleteJobExperience */
export async function deleteWorkerProject(projectId: string) {
  return deleteJobExperience(projectId);
}

export async function getJobExperiences() {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("job_experiences")
    .select("id, company_name, role_title, start_date, end_date, description, skills_used")
    .eq("worker_id", ctx.profile.id)
    .order("start_date", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    skillsUsed: row.skills_used ?? [],
  }));
}

/** @deprecated Use getJobExperiences */
export async function getWorkerProjects() {
  return getJobExperiences();
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
  const fileBuffer = await file.arrayBuffer();

  if (fileBuffer.byteLength === 0) {
    return { error: "Uploaded file is empty. Please choose a different image." };
  }

  const admin = await createAdminClient();
  const stored = await replaceStorageImage(
    admin,
    PROFILE_AVATAR_BUCKET,
    ctx.user.id,
    "avatar",
    fileBuffer,
    mimeType,
    extension
  );

  if ("error" in stored) {
    safeError("uploadWorkerAvatar storage:", stored.error);
    return { error: mapProfileImageUploadError(stored.error, "avatar") };
  }

  const { publicUrl: avatarUrl, storagePath } = stored;

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

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

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
    const admin = await createAdminClient();
    const knownPath = storagePathFromPublicUrl(
      profile.avatar_url,
      PROFILE_AVATAR_BUCKET
    );

    const { data: existingFiles } = await admin.storage
      .from(PROFILE_AVATAR_BUCKET)
      .list(ctx.user.id, { limit: 100 });

    const pathsToRemove = [
      ...(knownPath ? [knownPath] : []),
      ...(existingFiles ?? [])
        .filter(
          (entry) =>
            entry.name.startsWith("avatar.") || entry.name.startsWith("avatar-")
        )
        .map((entry) => `${ctx.user.id}/${entry.name}`),
    ];

    if (pathsToRemove.length > 0) {
      await admin.storage
        .from(PROFILE_AVATAR_BUCKET)
        .remove([...new Set(pathsToRemove)]);
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

export async function uploadWorkerResume(formData: FormData) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file was uploaded." };
  }

  // 5MB limit
  if (file.size > 5242880) {
    return { error: "File exceeds 5MB maximum limit." };
  }

  if (file.type !== "application/pdf") {
    return { error: "Only PDF documents are allowed." };
  }

  const fileBuffer = await file.arrayBuffer();
  if (fileBuffer.byteLength === 0) {
    return { error: "Uploaded file is empty." };
  }

  const admin = await createAdminClient();
  const storagePath = `${ctx.user.id}/resume.pdf`;

  const { error: uploadError } = await admin.storage
    .from("resumes")
    .upload(storagePath, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    safeError("uploadWorkerResume storage:", uploadError);
    return { error: "Failed to upload resume to secure storage." };
  }

  const { data: updatedRow, error: updateError } = await ctx.supabase
    .from("profiles")
    .update({
      resume_url: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedRow) {
    safeError("uploadWorkerResume profile update:", updateError ?? "no row updated");
    await admin.storage.from("resumes").remove([storagePath]);
    return { error: "Your resume uploaded but we couldn't link it to your profile." };
  }

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/onboarding");
  revalidatePath("/", "layout");

  const { triggerSkillMatchForWorker } = await import(
    "@/lib/server/matching/skill-match-outreach"
  );
  triggerSkillMatchForWorker(ctx.profile.id);

  return { success: true, resumeUrl: storagePath };
}

export async function deleteWorkerResume() {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const admin = await createAdminClient();
  const storagePath = `${ctx.user.id}/resume.pdf`;

  await admin.storage.from("resumes").remove([storagePath]);

  const { data: updatedRow, error } = await ctx.supabase
    .from("profiles")
    .update({
      resume_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.profile.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedRow) return { error: "Failed to remove resume." };

  await invalidateWorkerCache(ctx.profile.id);
  await invalidateEmployerCachesForWorker(ctx.profile.id);
  revalidatePath("/worker/profile");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/onboarding");
  revalidatePath("/", "layout");

  return { success: true };
}

export async function getWorkerResumePreviewUrl() {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { data: profile, error: dbError } = await ctx.supabase
    .from("profiles")
    .select("resume_url")
    .eq("id", ctx.profile.id)
    .single();

  if (dbError || !profile || !profile.resume_url) {
    return { error: "No resume uploaded." };
  }

  const admin = await createAdminClient();
  const { data, error } = await admin.storage
    .from("resumes")
    .createSignedUrl(profile.resume_url, 60 * 5); // 5 minutes validity

  if (error || !data?.signedUrl) {
    safeError("getWorkerResumePreviewUrl signed url:", error);
    return { error: "Failed to generate preview link." };
  }

  return { success: true, previewUrl: data.signedUrl };
}

