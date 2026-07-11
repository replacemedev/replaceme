"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";

export interface NotificationPreferences {
  emailApplications: boolean;
  emailMessages: boolean;
  inAppEnabled: boolean;
}

const prefsSchema = z
  .object({
    emailApplications: z.boolean(),
    emailMessages: z.boolean(),
    inAppEnabled: z.boolean(),
  })
  .strict();

const DEFAULT_PREFS: NotificationPreferences = {
  emailApplications: true,
  emailMessages: true,
  inAppEnabled: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PREFS;

  const { data } = await supabase
    .from("notification_preferences")
    .select("email_applications, email_messages, in_app_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return DEFAULT_PREFS;

  return {
    emailApplications: data.email_applications,
    emailMessages: data.email_messages,
    inAppEnabled: data.in_app_enabled,
  };
}

export async function saveNotificationPreferences(payload: unknown) {
  const result = await runAction("saveNotificationPreferences", async () => {
    const parsed = prefsSchema.parse(payload);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fail("Unauthorized");

    const { error } = await supabase.from("notification_preferences").upsert(
      {
        user_id: user.id,
        email_applications: parsed.emailApplications,
        email_messages: parsed.emailMessages,
        email_offers: true, // Keep DB schema happy without migrations
        in_app_enabled: parsed.inAppEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) return fail("Failed to save preferences.");

    revalidatePath("/worker/settings/notifications");
    return ok();
  });

  return result.success ? { success: true } : { error: result.error };
}
