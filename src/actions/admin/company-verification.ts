"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/actions/admin-actions";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  employerId: z.string().uuid(),
  status: z.enum(["verified", "unverified"]),
});

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Trust badge for employer company profiles (marketplace signal, not tax KYC).
 */
export async function updateCompanyVerification(
  input: z.infer<typeof schema>
): Promise<ActionResult> {
  try {
    await requireAdminCapability("users");
    const parsed = schema.parse(input);
    const admin = await createAdminClient();

    const now = new Date().toISOString();
    const { data, error } = await admin
      .from("company_profiles")
      .update({
        company_verification_status: parsed.status,
        verified_at: parsed.status === "verified" ? now : null,
        updated_at: now,
      })
      .eq("employer_id", parsed.employerId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!data) {
      return { success: false, error: "Company profile not found." };
    }

    await logAdminAction(
      parsed.status === "verified"
        ? "verify_company_profile"
        : "unverify_company_profile",
      "company_profile",
      data.id,
      { employer_id: parsed.employerId, status: parsed.status }
    );

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/employers/${parsed.employerId}`);
    revalidatePath("/employer/settings/company");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update company verification",
    };
  }
}
