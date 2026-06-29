"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { upsertPageContent } from "@/actions/admin/page-content";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminLayoutPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { ADMIN_CARD } from "@/lib/admin/ui-tokens";
import type { PageContentRow } from "@/types/page-content";
import type { PageContentDefinition } from "@/types/page-content";

interface PageContentEditorProps {
  definition: PageContentDefinition;
  initial: PageContentRow;
}

export function PageContentEditor({ definition, initial }: PageContentEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body ?? "");
  const [contentJson, setContentJson] = useState(
    JSON.stringify(initial.contentJson ?? {}, null, 2)
  );
  const [metaJson, setMetaJson] = useState(
    JSON.stringify(initial.meta ?? {}, null, 2)
  );
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    let parsedContent: Record<string, unknown> = {};
    let parsedMeta: Record<string, unknown> = {};

    if (definition.contentType === "json") {
      try {
        parsedContent = JSON.parse(contentJson) as Record<string, unknown>;
      } catch {
        setMessage("Invalid JSON in content field.");
        return;
      }
    }

    try {
      parsedMeta = JSON.parse(metaJson) as Record<string, unknown>;
    } catch {
      setMessage("Invalid JSON in meta field.");
      return;
    }

    startTransition(async () => {
      const result = await upsertPageContent({
        slug: definition.slug,
        title,
        body: definition.contentType === "html" ? body : null,
        contentJson: definition.contentType === "json" ? parsedContent : {},
        meta: parsedMeta,
        isPublished,
      });

      setMessage(
        result.success
          ? "Saved. Public page will refresh on next visit."
          : result.error ?? "Save failed."
      );
    });
  }

  return (
    <AdminPageShell>
      <Link
        href="/admin/settings/pages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        All pages
      </Link>

      <AdminLayoutPageHeader
        title={definition.label}
        subhead={definition.description}
        badge={
          <span className="text-xs text-[#006e2f] font-mono">
            {definition.publicPath}
          </span>
        }
      />

      <div className={`${ADMIN_CARD} divide-y divide-slate-100`}>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>

        {definition.contentType === "html" ? (
          <Field label="Body (HTML)" hint="Leave empty to use built-in fallback copy on the public page.">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </Field>
        ) : (
          <Field label="Content (JSON)" hint="Structured page data. Invalid JSON blocks save.">
            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              rows={14}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </Field>
        )}

        <Field label="Meta (JSON)" hint='e.g. {"lastUpdated":"January 26, 2026"}'>
          <textarea
            value={metaJson}
            onChange={(e) => setMetaJson(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
          />
        </Field>

        <Field label="Published">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Visible on public site
          </label>
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : "Save page"}
        </button>
        {message ? (
          <p className="text-sm text-slate-600">{message}</p>
        ) : null}
      </div>
    </AdminPageShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint ? <p className="text-xs text-slate-500 mt-0.5">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
