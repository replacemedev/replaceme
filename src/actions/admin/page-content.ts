"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import {
  PAGE_CONTENT_DEFINITIONS,
  PAGE_CONTENT_SLUGS,
  PAGE_CONTENT_TAG,
} from "@/config/page-content";
import { safeError } from "@/utils/logger";
import type { PageContentRow } from "@/types/page-content";

const slugSchema = z.enum([...PAGE_CONTENT_SLUGS] as [string, ...string[]]);

const upsertSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  body: z.string().max(200_000).optional().nullable(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
});

function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  body: string | null;
  content_json: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  is_published: boolean;
  updated_at: string;
}): PageContentRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    contentType: row.content_type as PageContentRow["contentType"],
    body: row.body,
    contentJson: row.content_json ?? {},
    meta: (row.meta ?? {}) as PageContentRow["meta"],
    isPublished: row.is_published,
    updatedAt: row.updated_at,
  };
}

export async function listAdminPageContent(): Promise<PageContentRow[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("page_content")
    .select(
      "id, slug, title, content_type, body, content_json, meta, is_published, updated_at"
    )
    .order("slug");

  if (error) {
    safeError("listAdminPageContent:", error);
    return [];
  }

  const bySlug = new Map((data ?? []).map((row) => [row.slug, mapRow(row)]));

  return PAGE_CONTENT_DEFINITIONS.map((def) => {
    const existing = bySlug.get(def.slug);
    if (existing) return existing;
    return {
      id: "",
      slug: def.slug,
      title: def.label,
      contentType: def.contentType,
      body: null,
      contentJson: {},
      meta: {},
      isPublished: true,
      updatedAt: new Date(0).toISOString(),
    };
  });
}

export async function getAdminPageContent(
  slug: string
): Promise<PageContentRow | null> {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("page_content")
    .select(
      "id, slug, title, content_type, body, content_json, meta, is_published, updated_at"
    )
    .eq("slug", parsed.data)
    .maybeSingle();

  if (error) {
    safeError("getAdminPageContent:", error);
    return null;
  }

  if (data) return mapRow(data);

  const def = PAGE_CONTENT_DEFINITIONS.find((d) => d.slug === parsed.data);
  if (!def) return null;

  return {
    id: "",
    slug: def.slug,
    title: def.label,
    contentType: def.contentType,
    body: null,
    contentJson: {},
    meta: {},
    isPublished: true,
    updatedAt: new Date(0).toISOString(),
  };
}

export async function upsertPageContent(
  input: z.infer<typeof upsertSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const def = PAGE_CONTENT_DEFINITIONS.find((d) => d.slug === parsed.data.slug);
  if (!def) return { success: false, error: "Unknown page slug" };

  try {
    const { supabase, user } = await requireAdmin();
    const payload = {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content_type: def.contentType,
      body: parsed.data.body ?? null,
      content_json: parsed.data.contentJson ?? {},
      meta: parsed.data.meta ?? {},
      is_published: parsed.data.isPublished ?? true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    const { error } = await supabase
      .from("page_content")
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      safeError("upsertPageContent:", error);
      return { success: false, error: error.message };
    }

    const { logAdminAction } = await import("@/actions/admin-actions");
    await logAdminAction("upsert_page_content", "page_content", parsed.data.slug, {
      is_published: payload.is_published,
    });

    revalidateTag(PAGE_CONTENT_TAG, "max");
    revalidateTag(`page-content-${parsed.data.slug}`, "max");
    revalidatePath(def.publicPath);
    revalidatePath("/admin/settings/pages");

    return { success: true };
  } catch (err) {
    safeError("upsertPageContent:", err);
    return { success: false, error: "Unauthorized or server error" };
  }
}
