"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export type EmployerAccountDetails = {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  country: string | null;
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
      .select(
        "first_name, middle_name, last_name, username, email, avatar_url, role, phone_number, country"
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") return null;

    return {
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      username: profile.username,
      email: profile.email ?? user.email ?? null,
      role: profile.role,
      avatarUrl: profile.avatar_url,
      phoneNumber: profile.phone_number,
      country: profile.country,
    };
  } catch (err) {
    safeError("getEmployerAccountDetails error:", err);
    return null;
  }
}

export async function updateEmployerAccountDetails(data: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber?: string | null;
  country?: string | null;
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
        middle_name: data.middleName || null,
        last_name: data.lastName,
        phone_number: data.phoneNumber || null,
        tin_number: null,
        birth_date: null,
        gender: null,
        civil_status: null,
        country: data.country || null,
      })
      .eq("id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    safeError("updateEmployerAccountDetails error:", err);
    return { success: false, error: "Failed to update profile details." };
  }
}
