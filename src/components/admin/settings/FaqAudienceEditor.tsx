"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { saveFaqPage } from "@/actions/admin/faq";
import { parseFaqPageConfig } from "@/lib/faq/parse-faq-config";
import type { FaqEntry, FaqPageConfig, PageContentRow } from "@/types/page-content";

interface FaqAudienceEditorProps {
  slug: "employer-faq" | "worker-faq";
  label: string;
  initial: PageContentRow;
  fallback: FaqPageConfig;
}

export function FaqAudienceEditor({
  slug,
  label,
  initial,
  fallback,
}: FaqAudienceEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [items, setItems] = useState<FaqEntry[]>(
    () => parseFaqPageConfig(initial.contentJson, fallback).items
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<FaqEntry>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    setMessage(null);
    const cleaned = items
      .map((item) => ({
        ...item,
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer);

    if (cleaned.length === 0) {
      setMessage("Add at least one question and answer.");
      return;
    }

    startTransition(async () => {
      const result = await saveFaqPage({
        slug,
        title: title.trim() || label,
        items: cleaned,
      });
      setMessage(result.success ? "Saved." : result.error ?? "Save failed.");
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{label}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Slug: {slug}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add FAQ
        </button>
      </div>

      <div className="px-5 py-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-600">
          Page title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="px-5 py-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No FAQ items yet.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Item {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <label className="block text-xs font-semibold text-slate-600">
                Question
                <input
                  value={item.question}
                  onChange={(e) => updateItem(item.id, { question: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Answer
                <textarea
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : `Save ${label}`}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}
