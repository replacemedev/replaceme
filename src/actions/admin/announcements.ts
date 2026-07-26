"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth/session";
import { fetchEmployerEntitlements } from "@/lib/server/entitlements";

const EMAIL_PATH = "/admin/reports/email";

type ActionResult = { success: true } | { success: false; error: string };

export type ProductAnnouncementRow = {
  id: string;
  feature_key: string;
  title: string;
  summary: string;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  teaser_title: string | null;
  teaser_summary: string | null;
  audience: string;
  status: string;
  enabled: boolean;
  requires_early_access: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  featureKey: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9_-]*$/i, "Use letters, numbers, _ or -"),
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(3).max(280),
  body: z.string().trim().max(4000).optional().nullable(),
  ctaLabel: z.string().trim().max(60).optional().nullable(),
  ctaHref: z.string().trim().max(300).optional().nullable(),
  teaserTitle: z.string().trim().max(120).optional().nullable(),
  teaserSummary: z.string().trim().max(280).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  enabled: z.boolean(),
  requiresEarlyAccess: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export async function listProductAnnouncements(): Promise<{
  announcements: ProductAnnouncementRow[];
}> {
  await requireAdminCapability("email");
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("product_announcements")
    .select(
      "id, feature_key, title, summary, body, cta_label, cta_href, teaser_title, teaser_summary, audience, status, enabled, requires_early_access, starts_at, ends_at, created_at, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return { announcements: (data ?? []) as ProductAnnouncementRow[] };
}

export async function upsertProductAnnouncement(
  input: z.infer<typeof upsertSchema>
): Promise<ActionResult & { id?: string }> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = upsertSchema.parse(input);
    const admin = await createAdminClient();

    const row = {
      feature_key: parsed.featureKey,
      title: parsed.title,
      summary: parsed.summary,
      body: parsed.body || null,
      cta_label: parsed.ctaLabel || null,
      cta_href: parsed.ctaHref || null,
      teaser_title: parsed.teaserTitle || null,
      teaser_summary: parsed.teaserSummary || null,
      status: parsed.status,
      enabled: parsed.enabled,
      requires_early_access: parsed.requiresEarlyAccess,
      starts_at: parsed.startsAt || null,
      ends_at: parsed.endsAt || null,
      updated_by: user.id,
    };

    if (parsed.id) {
      const { error } = await admin
        .from("product_announcements")
        .update(row)
        .eq("id", parsed.id);
      if (error) return { success: false, error: error.message };
      revalidatePath(EMAIL_PATH);
      revalidatePath("/employer/dashboard");
      return { success: true, id: parsed.id };
    }

    const { data, error } = await admin
      .from("product_announcements")
      .insert({ ...row, created_by: user.id })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath(EMAIL_PATH);
    revalidatePath("/employer/dashboard");
    return { success: true, id: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save announcement.",
    };
  }
}

export type EmployerAnnouncementView = {
  id: string;
  featureKey: string;
  variant: "early_access" | "teaser" | "paused";
  title: string;
  summary: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export async function getActiveEmployerAnnouncement(): Promise<EmployerAnnouncementView | null> {
  const { profile } = await requireRole("employer");
  const supabase = await createClient();
  const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
  const earlyAccess = Boolean(entitlements?.earlyAccess);
  const isScale = entitlements?.planSlug === "scale";

  const now = new Date().toISOString();
  const { data: announcements, error } = await supabase
    .from("product_announcements")
    .select(
      "id, feature_key, title, summary, cta_label, cta_href, teaser_title, teaser_summary, enabled, requires_early_access, starts_at, ends_at"
    )
    .eq("status", "published")
    .eq("audience", "employer")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error || !announcements?.length) return null;

  const { data: dismissals } = await supabase
    .from("announcement_dismissals")
    .select("announcement_id")
    .eq("user_id", profile.id);

  const dismissed = new Set((dismissals ?? []).map((d) => d.announcement_id));

  const active = announcements.find((a) => {
    if (dismissed.has(a.id)) return false;
    if (a.starts_at && a.starts_at > now) return false;
    if (a.ends_at && a.ends_at < now) return false;
    return true;
  });

  if (!active) return null;

  if (active.requires_early_access && !active.enabled) {
    if (!isScale) {
      return {
        id: active.id,
        featureKey: active.feature_key,
        variant: "teaser",
        title:
          active.teaser_title ??
          "Coming soon — Early Access on Scale",
        summary:
          active.teaser_summary ??
          "This feature will be available soon on the Scale plan with Early Access to New Features.",
        ctaLabel: "View Scale plan",
        ctaHref: "/employer/pricing",
      };
    }
    return {
      id: active.id,
      featureKey: active.feature_key,
      variant: "paused",
      title: "This feature is temporarily off",
      summary:
        "Early Access for this feature is disabled right now. We will restore it when it is ready.",
      ctaLabel: null,
      ctaHref: null,
    };
  }

  if (isScale && !earlyAccess && active.requires_early_access) {
    return {
      id: active.id,
      featureKey: active.feature_key,
      variant: "paused",
      title: "Early Access is temporarily paused",
      summary:
        "Scale Early Access is turned off right now. We will notify you when new features reopen.",
      ctaLabel: null,
      ctaHref: null,
    };
  }

  if (earlyAccess && active.enabled) {
    return {
      id: active.id,
      featureKey: active.feature_key,
      variant: "early_access",
      title: active.title,
      summary: active.summary,
      ctaLabel: active.cta_label,
      ctaHref: active.cta_href,
    };
  }

  return {
    id: active.id,
    featureKey: active.feature_key,
    variant: "teaser",
    title:
      active.teaser_title ??
      "Coming soon — Early Access on Scale",
    summary:
      active.teaser_summary ??
      "This feature will be available soon on the Scale plan with Early Access to New Features.",
    ctaLabel: "View Scale plan",
    ctaHref: "/employer/pricing",
  };
}

export async function dismissAnnouncement(
  announcementId: string
): Promise<ActionResult> {
  try {
    const { profile } = await requireRole("employer");
    const supabase = await createClient();
    const { error } = await supabase.from("announcement_dismissals").upsert(
      {
        announcement_id: announcementId,
        user_id: profile.id,
        dismissed_at: new Date().toISOString(),
      },
      { onConflict: "announcement_id,user_id" }
    );
    if (error) return { success: false, error: error.message };
    revalidatePath("/employer/dashboard");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dismiss.",
    };
  }
}
