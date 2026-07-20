import type { FaqEntry, FaqPageConfig } from "@/types/page-content";

function isFaqEntry(value: unknown): value is FaqEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.question === "string" &&
    typeof row.answer === "string"
  );
}

export function parseFaqPageConfig(
  contentJson: Record<string, unknown> | null | undefined,
  fallback: FaqPageConfig
): FaqPageConfig {
  const raw = contentJson?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return fallback;
  }

  const items = raw
    .filter(isFaqEntry)
    .map((item) => ({
      id: item.id,
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter(
      (item) =>
        !item.question.toLowerCase().includes("e2e") &&
        !item.answer.toLowerCase().includes("e2e") &&
        !item.id.toLowerCase().includes("e2e")
    );

  return items.length > 0 ? { items } : fallback;
}
