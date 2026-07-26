"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { createAdminClient } from "@/lib/supabase/server";
import { invalidateEmployerCache } from "@/lib/server/entitlements";
import { safeError } from "@/utils/logger";
import {
  CRITICAL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_REGISTRY,
  type EmailTemplateRegistryItem,
} from "@/lib/server/email/template-registry";

const EMAIL_PATH = "/admin/reports/email";

type ActionResult = { success: true } | { success: false; error: string };

export async function getScaleEarlyAccessEnabled(): Promise<boolean> {
  await requireAdminCapability("email");
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("billing_plans")
    .select("early_access")
    .eq("slug", "scale")
    .maybeSingle();

  if (error) {
    safeError("getScaleEarlyAccessEnabled", error);
    return false;
  }
  return Boolean(data?.early_access);
}

export async function setScaleEarlyAccessEnabled(
  enabled: boolean
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const admin = await createAdminClient();

    const { error } = await admin
      .from("billing_plans")
      .update({ early_access: enabled })
      .eq("slug", "scale");

    if (error) {
      return { success: false, error: error.message };
    }

    // Invalidate Scale employers so entitlements refresh promptly.
    const { data: subs } = await admin
      .from("employer_subscriptions")
      .select("employer_id")
      .eq("plan_slug", "scale");

    await Promise.all(
      (subs ?? []).map((s) => invalidateEmployerCache(s.employer_id))
    );

    void user;
    revalidatePath(EMAIL_PATH);
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/pricing");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update Early Access.",
    };
  }
}

export type AdminEmailTemplateRow = EmailTemplateRegistryItem & {
  enabled: boolean;
};

export async function listEmailTemplates(): Promise<{
  templates: AdminEmailTemplateRow[];
}> {
  await requireAdminCapability("email");
  const admin = await createAdminClient();
  const { data } = await admin
    .from("email_template_settings")
    .select("template_key, enabled");

  const enabledMap = new Map(
    (data ?? []).map((r) => [r.template_key, r.enabled] as const)
  );

  return {
    templates: EMAIL_TEMPLATE_REGISTRY.map((item) => ({
      ...item,
      enabled: item.critical
        ? true
        : (enabledMap.get(item.key) ?? true),
    })),
  };
}

const toggleSchema = z.object({
  templateKey: z.string().min(1),
  enabled: z.boolean(),
});

export async function setEmailTemplateEnabled(
  input: z.infer<typeof toggleSchema>
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = toggleSchema.parse(input);

    if (CRITICAL_TEMPLATE_KEYS.has(parsed.templateKey)) {
      return {
        success: false,
        error: "Critical auth templates cannot be disabled.",
      };
    }

    if (!EMAIL_TEMPLATE_REGISTRY.some((t) => t.key === parsed.templateKey)) {
      return { success: false, error: "Unknown template key." };
    }

    const admin = await createAdminClient();
    const { error } = await admin.from("email_template_settings").upsert(
      {
        template_key: parsed.templateKey,
        enabled: parsed.enabled,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "template_key" }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath(EMAIL_PATH);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update template.",
    };
  }
}

export async function previewEmailTemplate(templateKey: string): Promise<
  | { success: true; subject: string; html: string }
  | { success: false; error: string }
> {
  await requireAdminCapability("email");
  const item = EMAIL_TEMPLATE_REGISTRY.find((t) => t.key === templateKey);
  if (!item) return { success: false, error: "Unknown template." };

  // Lightweight admin preview shell — full React Email render is used for broadcasts.
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:24px;color:#0f172a;">
  <p style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">${item.category} · ${item.channel}</p>
  <h1 style="font-size:20px;margin:8px 0 12px;">${item.name}</h1>
  <p style="font-size:15px;line-height:1.5;color:#334155;">${item.description}</p>
  <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Preview placeholder for template_key <code>${item.key}</code>. Live sends use production templates.</p>
  <p style="font-size:12px;color:#94a3b8;">© Replaceme · support@replaceme.ph</p>
</body></html>`;

  return {
    success: true,
    subject: `[Preview] ${item.name}`,
    html,
  };
}
