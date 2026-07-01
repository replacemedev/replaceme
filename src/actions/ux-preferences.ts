"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  applyUxPreferenceCookies,
  getUxCookies,
} from "@/lib/cookies/server";
import type { ThemePreference } from "@/lib/cookies/constants";
import { fail, ok, runAction, type ActionResult } from "@/lib/server/action-result";

const saveUxPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

export type UxPreferencesRow = {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  locale: string | null;
  updatedAt: string;
};

export async function getUxPreferencesForUser(): Promise<UxPreferencesRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_ux_preferences")
    .select("theme, sidebar_collapsed, locale, updated_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    theme: data.theme as ThemePreference,
    sidebarCollapsed: data.sidebar_collapsed,
    locale: data.locale,
    updatedAt: data.updated_at,
  };
}

export async function saveUxPreferences(payload: unknown): Promise<ActionResult> {
  return runAction("saveUxPreferences", async () => {
    const parsed = saveUxPreferencesSchema.parse(payload);
    const ux = await getUxCookies();
    if (!ux.hasConsent) {
      return fail("Cookie consent is required before saving UX preferences.");
    }

    await applyUxPreferenceCookies({
      theme: parsed.theme,
      sidebarCollapsed: parsed.sidebarCollapsed,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && (parsed.theme !== undefined || parsed.sidebarCollapsed !== undefined)) {
      const existing = await supabase
        .from("user_ux_preferences")
        .select("theme, sidebar_collapsed")
        .eq("profile_id", user.id)
        .maybeSingle();

      const { error } = await supabase.from("user_ux_preferences").upsert(
        {
          profile_id: user.id,
          theme: parsed.theme ?? existing.data?.theme ?? ux.theme,
          sidebar_collapsed:
            parsed.sidebarCollapsed ??
            existing.data?.sidebar_collapsed ??
            ux.sidebar === "collapsed",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      );

      if (error) return fail("Failed to save UX preferences.");
    }

    return ok();
  });
}

export async function fetchUxPreferencesForHydration(
  profileId: string
): Promise<{ theme: ThemePreference; sidebarCollapsed: boolean } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_ux_preferences")
    .select("theme, sidebar_collapsed")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!data) return null;

  return {
    theme: data.theme as ThemePreference,
    sidebarCollapsed: data.sidebar_collapsed,
  };
}
