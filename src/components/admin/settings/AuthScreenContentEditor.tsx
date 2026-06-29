"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { upsertPageContent } from "@/actions/admin/page-content";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminLayoutPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { ADMIN_CARD } from "@/lib/admin/ui-tokens";
import { PageContentPreview } from "@/components/admin/settings/PageContentPreview";
import type { AuthScreenConfig, PageContentRow } from "@/types/page-content";
import type { PageContentDefinition } from "@/types/page-content";

interface AuthScreenContentEditorProps {
  definition: PageContentDefinition;
  initial: PageContentRow;
}

function parseAuthConfig(json: Record<string, unknown>): AuthScreenConfig {
  return {
    headline: typeof json.headline === "string" ? json.headline : "",
    description: typeof json.description === "string" ? json.description : "",
    signupPrompt:
      typeof json.signupPrompt === "string" ? json.signupPrompt : "",
    signupLinkLabel:
      typeof json.signupLinkLabel === "string" ? json.signupLinkLabel : "",
    testimonialQuote:
      typeof json.testimonialQuote === "string" ? json.testimonialQuote : "",
    testimonialName:
      typeof json.testimonialName === "string" ? json.testimonialName : "",
    testimonialRole:
      typeof json.testimonialRole === "string" ? json.testimonialRole : "",
  };
}

export function AuthScreenContentEditor({
  definition,
  initial,
}: AuthScreenContentEditorProps) {
  const initialConfig = parseAuthConfig(initial.contentJson ?? {});
  const [title, setTitle] = useState(initial.title);
  const [config, setConfig] = useState<AuthScreenConfig>(initialConfig);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof AuthScreenConfig>(
    key: K,
    value: AuthScreenConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await upsertPageContent({
        slug: definition.slug,
        title,
        body: null,
        contentJson: { ...config },
        meta: { lastUpdated: new Date().toLocaleDateString() },
        isPublished,
      });

      if (result.success) {
        toast.success("Auth screen saved. Public pages will refresh on next visit.");
      } else {
        toast.error(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <AdminPageShell width="wide">
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
        actions={
          <a
            href={definition.publicPath}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#006e2f] hover:underline"
          >
            Preview public route
          </a>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className={`${ADMIN_CARD} divide-y divide-slate-100`}>
          <AuthField label="Page title (admin)">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Headline" hint="Primary heading on the auth form panel.">
            <input
              value={config.headline ?? ""}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Description" hint="Supporting copy below the headline.">
            <textarea
              value={config.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </AuthField>

          <AuthField
            label="Secondary prompt"
            hint={'e.g. "Don\'t have an account?" — leave blank if not used on this screen.'}
          >
            <input
              value={config.signupPrompt ?? ""}
              onChange={(e) => updateField("signupPrompt", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Secondary link label" hint='e.g. "Sign up" or "Log in".'>
            <input
              value={config.signupLinkLabel ?? ""}
              onChange={(e) => updateField("signupLinkLabel", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Testimonial quote">
            <textarea
              value={config.testimonialQuote ?? ""}
              onChange={(e) => updateField("testimonialQuote", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </AuthField>

          <AuthField label="Testimonial name">
            <input
              value={config.testimonialName ?? ""}
              onChange={(e) => updateField("testimonialName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Testimonial role">
            <input
              value={config.testimonialRole ?? ""}
              onChange={(e) => updateField("testimonialRole", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </AuthField>

          <AuthField label="Published">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Visible on public auth pages (no fallback copy when off)
            </label>
          </AuthField>
        </div>

        <PageContentPreview slug={definition.slug} config={config} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006e2f] text-white text-sm font-bold hover:bg-[#005c26] disabled:opacity-60 min-h-[44px]"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : "Save auth screen"}
        </button>
      </div>
    </AdminPageShell>
  );
}

function AuthField({
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
        {hint ? <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
