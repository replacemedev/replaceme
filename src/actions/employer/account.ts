"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetLink } from "@/actions/auth";
import { safeError } from "@/utils/logger";

export type EmployerAccountDetails = {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
  birthDate: string | null;
  gender: string | null;
  civilStatus: string | null;
  phoneNumber: string | null;
  tinNumber: string | null;
  idType: string | null;
  idNumber: string | null;
  idExpirationDate: string | null;
  idIssuingCountry: string | null;
  personalAddress: string | null;
  personalCity: string | null;
  personalStateProvince: string | null;
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
      .select("first_name, middle_name, last_name, username, email, avatar_url, role, birth_date, gender, civil_status, phone_number, tin_number, id_type, id_number, id_expiration_date, id_issuing_country, personal_address, personal_city, personal_state_province, country")
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
      birthDate: profile.birth_date,
      gender: profile.gender,
      civilStatus: profile.civil_status,
      phoneNumber: profile.phone_number,
      tinNumber: profile.tin_number,
      idType: profile.id_type,
      idNumber: profile.id_number,
      idExpirationDate: profile.id_expiration_date,
      idIssuingCountry: profile.id_issuing_country,
      personalAddress: profile.personal_address,
      personalCity: profile.personal_city,
      personalStateProvince: profile.personal_state_province,
      country: profile.country,
    };
  } catch (err) {
    safeError("getEmployerAccountDetails error:", err);
    return null;
  }
}

export async function requestPasswordResetForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return { success: false, error: "No email found for your account." };
  }

  return sendPasswordResetLink(user.email);
}

export async function updateEmployerAccountDetails(data: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate?: string | null;
  gender?: string | null;
  civilStatus?: string | null;
  phoneNumber?: string | null;
  tinNumber?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
  personalAddress?: string | null;
  personalCity?: string | null;
  personalStateProvince?: string | null;
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
        birth_date: data.birthDate || null,
        gender: data.gender || null,
        civil_status: data.civilStatus || null,
        phone_number: data.phoneNumber || null,
        tin_number: data.tinNumber || null,
        id_type: data.idType || null,
        id_number: data.idNumber || null,
        id_expiration_date: data.idExpirationDate || null,
        id_issuing_country: data.idIssuingCountry || null,
        personal_address: data.personalAddress || null,
        personal_city: data.personalCity || null,
        personal_state_province: data.personalStateProvince || null,
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
