"use server";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { PAGE_CONTENT_TAG } from "@/config/page-content";
import { safeError } from "@/utils/logger";
import type { PageContentRow } from "@/types/page-content";

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

async function fetchPublishedPageContent(
  slug: string
): Promise<PageContentRow | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("page_content")
      .select(
        "id, slug, title, content_type, body, content_json, meta, is_published, updated_at"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      safeError(`fetchPublishedPageContent(${slug}):`, error);
      return null;
    }

    return data ? mapRow(data) : null;
  } catch (err) {
    safeError(`fetchPublishedPageContent(${slug}):`, err);
    return null;
  }
}

export async function getPublishedPageContent(
  slug: string
): Promise<PageContentRow | null> {
  return unstable_cache(
    () => fetchPublishedPageContent(slug),
    [`page-content-${slug}`],
    { tags: [PAGE_CONTENT_TAG, `page-content-${slug}`] }
  )();
}
