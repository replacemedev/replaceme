"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/actions/admin-actions";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import { createAdminClient } from "@/lib/supabase/server";
import {
  mapProfileImageUploadError,
  PROFILE_IMAGE_MAX_BYTES,
  profileImageMaxMbLabel,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";
import {
  replaceStorageImage,
  storagePathFromPublicUrl,
} from "@/lib/storage/replace-storage-image";
import {
  updateAdminSelfProfileSchema,
  type UpdateAdminSelfProfileInput,
} from "@/lib/validations/admin-profile";
import type { AdminRole } from "@/types/admin.types";
import { safeError } from "@/utils/logger";

const PROFILE_AVATAR_BUCKET = "profile-avatars";
const PROFILE_PATH = "/admin/settings/profile";

export type AdminSelfProfile = {
  userId: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  department: string | null;
  timezone: string | null;
  bio: string | null;
  directoryPublic: boolean;
  adminRole: AdminRole;
};

/** Safe fields for public /team and admin directory cards. */
export type StaffDirectoryMember = {
  userId: string;
  displayName: string;
  department: string | null;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string | null;
  roleLabel: string;
};

type ActionResult = { success: true } | { success: false; error: string };

function revalidateProfileSurfaces() {
  revalidatePath(PROFILE_PATH);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/team");
  revalidatePath("/admin/settings/directory");
  revalidatePath("/team");
  revalidatePath("/admin", "layout");
}

export async function getAdminSelfProfile(): Promise<
  | { success: true; data: AdminSelfProfile }
  | { success: false; error: string }
> {
  try {
    const { user } = await requireAdminCapability("settings");
    const admin = await createAdminClient();

    const [{ data: profile, error: profileError }, { data: adminProfile }] =
      await Promise.all([
        admin
          .from("profiles")
          .select(
            "id, email, username, first_name, last_name, middle_name, phone_number, avatar_url, timezone, bio"
          )
          .eq("id", user.id)
          .maybeSingle(),
        admin
          .from("admin_profiles")
          .select(
            "display_name, department, avatar_url, admin_role, directory_public"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (profileError || !profile) {
      return {
        success: false,
        error: profileError?.message ?? "Profile not found.",
      };
    }

    const { adminRole } = await getCurrentAdminCapabilities();

    return {
      success: true,
      data: {
        userId: profile.id,
        email: profile.email,
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: profile.middle_name,
        phoneNumber: profile.phone_number,
        avatarUrl: profile.avatar_url ?? adminProfile?.avatar_url ?? null,
        displayName: adminProfile?.display_name ?? null,
        department: adminProfile?.department ?? null,
        timezone: profile.timezone ?? null,
        bio: profile.bio ?? null,
        directoryPublic: Boolean(adminProfile?.directory_public),
        adminRole: adminProfile?.admin_role ?? adminRole,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load admin profile",
    };
  }
}

export async function updateAdminSelfProfile(
  input: UpdateAdminSelfProfileInput
): Promise<ActionResult> {
  try {
    const { user } = await requireAdminCapability("settings");
    const parsed = updateAdminSelfProfileSchema.parse(input);
    const admin = await createAdminClient();

    const firstName = parsed.firstName.trim();
    const lastName = parsed.lastName.trim();
    const phoneNumber = parsed.phoneNumber?.trim() || null;
    const department = parsed.department?.trim() || null;
    const timezone = parsed.timezone?.trim() || null;
    const bio = parsed.bio?.trim() || null;
    const directoryPublic = parsed.directoryPublic ?? false;
    const displayName =
      parsed.displayName?.trim() ||
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      null;
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        full_name: fullName || null,
        timezone,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    const { error: adminProfileError } = await admin
      .from("admin_profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: displayName,
          department,
          directory_public: directoryPublic,
        },
        { onConflict: "user_id" }
      );

    if (adminProfileError) {
      return { success: false, error: adminProfileError.message };
    }

    await logAdminAction("update_admin_self_profile", "admin_profile", user.id, {
      fields: [
        "first_name",
        "last_name",
        "phone_number",
        "department",
        "display_name",
        "timezone",
        "bio",
        "directory_public",
      ],
    });

    revalidateProfileSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

export async function uploadAdminAvatar(formData: FormData): Promise<
  | { success: true; avatarUrl: string }
  | { success: false; error: string }
  | { error: string }
> {
  try {
    const { user } = await requireAdminCapability("settings");

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
      user.id,
      "avatar",
      fileBuffer,
      mimeType,
      extension
    );

    if ("error" in stored) {
      safeError("uploadAdminAvatar storage:", stored.error);
      return { error: mapProfileImageUploadError(stored.error, "avatar") };
    }

    const { publicUrl: avatarUrl, storagePath } = stored;
    const now = new Date().toISOString();

    const { error: profileError } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: now })
      .eq("id", user.id);

    if (profileError) {
      await admin.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);
      return {
        error:
          "Your photo uploaded but we couldn't link it to your profile. Please try again.",
      };
    }

    await admin.from("admin_profiles").upsert(
      {
        user_id: user.id,
        avatar_url: avatarUrl,
      },
      { onConflict: "user_id" }
    );

    await logAdminAction("upload_admin_avatar", "admin_profile", user.id, {});

    revalidateProfileSurfaces();
    return { success: true, avatarUrl };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to upload profile photo",
    };
  }
}

export async function removeAdminAvatar(): Promise<
  { success: true } | { error: string }
> {
  try {
    const { user } = await requireAdminCapability("settings");
    const admin = await createAdminClient();

    const [{ data: profile }, { data: adminProfile }] = await Promise.all([
      admin.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle(),
      admin
        .from("admin_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const urls = [profile?.avatar_url, adminProfile?.avatar_url].filter(
      (u): u is string => Boolean(u)
    );

    const knownPaths = urls
      .map((url) => storagePathFromPublicUrl(url, PROFILE_AVATAR_BUCKET))
      .filter((p): p is string => Boolean(p));

    const { data: existingFiles } = await admin.storage
      .from(PROFILE_AVATAR_BUCKET)
      .list(user.id, { limit: 100 });

    const pathsToRemove = [
      ...knownPaths,
      ...(existingFiles ?? [])
        .filter(
          (entry) =>
            entry.name.startsWith("avatar.") || entry.name.startsWith("avatar-")
        )
        .map((entry) => `${user.id}/${entry.name}`),
    ];

    if (pathsToRemove.length > 0) {
      await admin.storage
        .from(PROFILE_AVATAR_BUCKET)
        .remove([...new Set(pathsToRemove)]);
    }

    const now = new Date().toISOString();
    await admin
      .from("profiles")
      .update({ avatar_url: null, updated_at: now })
      .eq("id", user.id);

    await admin
      .from("admin_profiles")
      .update({ avatar_url: null })
      .eq("user_id", user.id);

    await logAdminAction("remove_admin_avatar", "admin_profile", user.id, {});

    revalidateProfileSurfaces();
    return { success: true };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to remove profile photo",
    };
  }
}

function toDirectoryMember(row: {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string | null;
  display_name: string | null;
  department: string | null;
  admin_avatar: string | null;
  admin_role: AdminRole | null;
}): StaffDirectoryMember {
  const full = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return {
    userId: row.id,
    displayName: row.display_name?.trim() || full || "Team member",
    department: row.department,
    avatarUrl: row.avatar_url ?? row.admin_avatar,
    bio: row.bio,
    timezone: row.timezone,
    roleLabel: row.admin_role === "superadmin" ? "Super admin" : "Moderator",
  };
}

async function loadStaffDirectoryMembers(options: {
  publicOnly: boolean;
}): Promise<StaffDirectoryMember[]> {
  const admin = await createAdminClient();

  let query = admin
    .from("admin_profiles")
    .select(
      "user_id, display_name, department, avatar_url, admin_role, directory_public"
    )
    .order("display_name", { ascending: true });

  if (options.publicOnly) {
    query = query.eq("directory_public", true);
  }

  const { data: adminRows, error } = await query;
  if (error || !adminRows?.length) return [];

  const ids = adminRows.map((r) => r.user_id);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, bio, timezone, account_status")
    .in("id", ids)
    .eq("role", "admin")
    .eq("account_status", "active");

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return adminRows
    .map((row) => {
      const profile = profileById.get(row.user_id);
      if (!profile) return null;
      return toDirectoryMember({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        timezone: profile.timezone,
        display_name: row.display_name,
        department: row.department,
        admin_avatar: row.avatar_url,
        admin_role: row.admin_role,
      });
    })
    .filter((m): m is StaffDirectoryMember => Boolean(m));
}

/** Opted-in staff for the public /team page (no email/phone). */
export async function fetchPublicStaffDirectory(): Promise<
  StaffDirectoryMember[]
> {
  try {
    return await loadStaffDirectoryMembers({ publicOnly: true });
  } catch {
    return [];
  }
}

/** Full active staff directory for admins (settings capability). */
export async function fetchAdminStaffDirectory(): Promise<
  | { success: true; data: StaffDirectoryMember[] }
  | { success: false; error: string }
> {
  try {
    await requireAdminCapability("settings");
    const data = await loadStaffDirectoryMembers({ publicOnly: false });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load staff directory",
    };
  }
}

