"use server";

import { upsertPageContent } from "@/actions/admin/page-content";
import { saveFaqPageSchema } from "@/lib/validations/admin/faq";
import type { FaqEntry } from "@/types/page-content";

export async function saveFaqPage(input: {
  slug: "employer-faq" | "worker-faq";
  title: string;
  items: FaqEntry[];
  isPublished?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = saveFaqPageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid FAQ data" };
  }

  return upsertPageContent({
    slug: parsed.data.slug,
    title: parsed.data.title,
    contentJson: { items: parsed.data.items },
    isPublished: parsed.data.isPublished ?? true,
  });
}
