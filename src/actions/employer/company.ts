"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { companyProfileSchema, CompanyProfileInput, DropdownOption } from "@/lib/validations/employer/company";
import { revalidatePath } from "next/cache";
import {
  PROFILE_IMAGE_MAX_BYTES,
  profileImageMaxMbLabel,
  resolveProfileImageMime,
} from "@/lib/storage/profile-image";

const COMPANY_LOGO_BUCKET = "company-logos";

/**
 * Fetch industries list.
 * Currently returns empty stub per scaffolding requirements.
 */
export async function getIndustries(): Promise<DropdownOption[]> {
  return [];
}

/**
 * Fetch existing employer company profile data.
 * Checks session, confirms role, and returns initial default fields.
 */
export async function getCompanyProfile(): Promise<CompanyProfileInput | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return null;
    }

    // Fetch company details from company_profiles table directly
    const { data: companyProfile, error: companyError } = await supabase
      .from("company_profiles")
      .select("company_name, website_url, industry, company_bio, logo_url")
      .eq("employer_id", profile.id)
      .maybeSingle();

    // Return current profile values
    return {
      companyName: companyProfile?.company_name || "",
      websiteUrl: companyProfile?.website_url || "",
      industry: companyProfile?.industry || "",
      companyBio: companyProfile?.company_bio || "",
      logoUrl: companyProfile?.logo_url || "",
    };
  } catch (err) {
    safeError("getCompanyProfile error occurred:", err);
    return null;
  }
}

/**
 * Update the employer company profile.
 * Implements strict payload check, session authentication, and role authorization.
 */
export async function updateCompanyProfile(payload: CompanyProfileInput) {
  try {
    safeLog("[Auth] Update company profile action initiated");

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can modify company profiles." };
    }

    // Strictly validate inputs using Zod
    const parsed = companyProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid input payload.";
      return { error: errorMsg };
    }

    // Upsert into company_profiles table directly
    const { error: upsertError } = await supabase
      .from("company_profiles")
      .upsert({
        employer_id: user.id,
        company_name: parsed.data.companyName,
        website_url: parsed.data.websiteUrl || null,
        industry: parsed.data.industry || null,
        company_bio: parsed.data.companyBio || null,
        logo_url: parsed.data.logoUrl || null,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      safeError("updateCompanyProfile upsert error occurred:", upsertError);
      return { error: "Failed to update company profile in database." };
    }

    safeLog("[Auth] Company profile successfully updated");
    revalidatePath("/employer/settings/company");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Company profile updated successfully!",
    };
  } catch (err) {
    safeError("updateCompanyProfile error occurred:", err);
    return { error: "An unexpected error occurred while updating the profile. Please try again." };
  }
}

export async function uploadCompanyLogo(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can upload company logos." };
    }

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
    const storagePath = `${user.id}/logo.${extension}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      safeError("uploadCompanyLogo storage:", uploadError);
      return {
        error:
          uploadError.message?.includes("maximum")
            ? `File exceeds ${profileImageMaxMbLabel()} maximum.`
            : "Failed to upload company logo. Use JPG or PNG up to 5 MB.",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(COMPANY_LOGO_BUCKET)
      .getPublicUrl(storagePath);

    const logoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("company_profiles")
      .update({ logo_url: logoUrl })
      .eq("employer_id", user.id);

    if (updateError) {
      safeError("uploadCompanyLogo db update:", updateError);
      await supabase.storage.from(COMPANY_LOGO_BUCKET).remove([storagePath]);
      return { error: "Failed to save logo to company profile." };
    }

    revalidatePath("/employer/settings/company");
    revalidatePath("/", "layout");

    return { success: true, logoUrl };
  } catch (err) {
    safeError("uploadCompanyLogo:", err);
    return { error: "An unexpected error occurred during logo upload. Please try again." };
  }
}
