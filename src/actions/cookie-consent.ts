"use server";

import { createClient } from "@/lib/supabase/server";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";
import { fail, ok, runAction, type ActionResult } from "@/lib/server/action-result";
import { saveCookieConsentSchema } from "@/lib/validations/cookie-consent";
import type { CookieConsentPreferences } from "@/lib/cookie-consent/types";

export async function getCookieConsentForUser(): Promise<CookieConsentPreferences | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("cookie_consent_preferences")
    .select(
      "consent_necessary, consent_analytics, consent_marketing, policy_version, consented_at"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    necessary: true,
    analytics: data.consent_analytics,
    marketing: data.consent_marketing,
    policyVersion: data.policy_version,
    consentedAt: data.consented_at,
  };
}

export async function saveCookieConsent(payload: unknown): Promise<ActionResult> {
  return runAction("saveCookieConsent", async () => {
    const parsed = saveCookieConsentSchema.parse(payload);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const now = new Date().toISOString();
    const necessary = true as const;

    const { error: eventError } = await supabase.from("cookie_consent_events").insert({
      profile_id: user?.id ?? null,
      anonymous_id: user ? null : parsed.anonymousId ?? null,
      consent_necessary: necessary,
      consent_analytics: parsed.analytics,
      consent_marketing: parsed.marketing,
      policy_version: COOKIE_POLICY_VERSION,
      action: parsed.action,
    });

    if (eventError) return fail("Failed to record consent.");

    if (user) {
      const { error: prefError } = await supabase.from("cookie_consent_preferences").upsert(
        {
          profile_id: user.id,
          consent_necessary: necessary,
          consent_analytics: parsed.analytics,
          consent_marketing: parsed.marketing,
          policy_version: COOKIE_POLICY_VERSION,
          consented_at: now,
          updated_at: now,
        },
        { onConflict: "profile_id" }
      );

      if (prefError) return fail("Failed to save preferences.");
    } else if (!parsed.anonymousId) {
      return fail("Anonymous consent requires an identifier.");
    }

    return ok();
  });
}
