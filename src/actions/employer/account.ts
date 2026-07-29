"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type EmployerAccountDetails = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
};

export async function getEmployerAccountDetails(): Promise<EmployerAccountDetails | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, avatar_url, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") return null;

    return {
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email ?? user.email ?? null,
      role: profile.role,
      avatarUrl: profile.avatar_url,
    };
  } catch (err) {
    safeError("getEmployerAccountDetails error:", err);
    return null;
  }
}

export async function updateEmployerAccountDetails(data: {
  firstName: string;
  lastName: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        tin_number: null,
        birth_date: null,
        gender: null,
        civil_status: null,
      })
      .eq("id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    safeError("updateEmployerAccountDetails error:", err);
    return { success: false, error: "Failed to update profile details." };
  }
}

const notificationPrefSchema = z.enum([
  "email_every_applicant",
  "email_daily_summary",
  "dashboard_only",
]);

export async function updateEmployerNotificationPref(
  pref: z.infer<typeof notificationPrefSchema>
) {
  try {
    const parsed = notificationPrefSchema.parse(pref);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("company_profiles")
      .update({
        application_notification_pref: parsed,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", user.id);

    if (error) throw error;
    revalidatePath("/employer/settings/account");
    return { success: true as const };
  } catch (err) {
    safeError("updateEmployerNotificationPref error:", err);
    return { success: false, error: "Failed to update notification preference." };
  }
}

export async function getEmployerNotificationPref(): Promise<
  z.infer<typeof notificationPrefSchema>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "email_every_applicant";

    const { data } = await supabase
      .from("company_profiles")
      .select("application_notification_pref")
      .eq("employer_id", user.id)
      .maybeSingle();

    return (
      (data?.application_notification_pref as z.infer<
        typeof notificationPrefSchema
      >) ?? "email_every_applicant"
    );
  } catch {
    return "email_every_applicant";
  }
}
