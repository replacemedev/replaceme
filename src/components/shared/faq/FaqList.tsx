import type { FaqEntry } from "@/types/page-content";

interface FaqListProps {
  items: FaqEntry[];
}

export function FaqList({ items }: FaqListProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 py-8">
        No questions have been published yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900">{item.question}</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {item.answer}
          </p>
        </article>
      ))}
    </div>
  );
}
