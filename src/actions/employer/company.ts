"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { companyProfileSchema, CompanyProfileInput, DropdownOption } from "@/lib/validations/employer/company";
import { revalidatePath } from "next/cache";

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

/**
 * Upload company logo placeholder action.
 * Prepares the backend pipeline to receive logo files and validates them.
 */
export async function uploadCompanyLogo(formData: FormData) {
  try {
    safeLog("[Auth] Upload company logo action initiated");

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
      return { error: "Access denied. Only employers can upload company logos." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file was uploaded." };
    }

    // Validate file size: 2MB Max
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: "File size exceeds the 2MB limit." };
    }

    // Validate file type: JPG, PNG
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Invalid file type. Only JPG, JPEG, and PNG are allowed." };
    }

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const logoUrl = "/images/logo_favicon.png";

    // Update the logoUrl in the database
    const { error: updateError } = await supabase
      .from("company_profiles")
      .update({ logo_url: logoUrl })
      .eq("employer_id", user.id);

    if (updateError) {
      safeError("uploadCompanyLogo db update error occurred:", updateError);
      return { error: "Failed to save logo URL to company profile." };
    }

    revalidatePath("/employer/settings/company");
    revalidatePath("/", "layout");

    return {
      success: true,
      logoUrl,
    };
  } catch (err) {
    safeError("uploadCompanyLogo error occurred:", err);
    return { error: "An unexpected error occurred during logo upload. Please try again." };
  }
}
