import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/server/auth/session";

export type ProfileRow = {
  id: string;
  role: AppRole;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  professional_title: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  resume_url: string | null;
  is_verified: boolean;
};

export async function getProfileById(
  supabase: SupabaseClient,
  profileId: string
) {
  return supabase
    .from("profiles")
    .select(
      "id, role, email, first_name, last_name, avatar_url, professional_title, bio, skills, experience_years, resume_url, is_verified"
    )
    .eq("id", profileId)
    .maybeSingle();
}

export async function getProfileRole(
  supabase: SupabaseClient,
  profileId: string
) {
  return supabase
    .from("profiles")
    .select("id, role")
    .eq("id", profileId)
    .single();
}
