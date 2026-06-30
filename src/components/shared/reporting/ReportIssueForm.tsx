"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createReport } from "@/actions/reports";
import { REPORT_CATEGORIES } from "@/lib/reporting/constants";

const CATEGORY_LABELS: Record<(typeof REPORT_CATEGORIES)[number], string> = {
  bug: "Bug",
  ui_error: "UI error",
  malicious_user: "Malicious user",
  feature_request: "Feature request",
  other: "Other",
};

export function ReportIssueForm({
  defaultReportedUrl,
  defaultAppArea,
  onSubmitted,
}: {
  defaultReportedUrl?: string;
  defaultAppArea?: string;
  onSubmitted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] =
    useState<(typeof REPORT_CATEGORIES)[number]>("bug");
  const [title, setTitle] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

  const computedUrl = useMemo(() => {
    if (defaultReportedUrl) return defaultReportedUrl;
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [defaultReportedUrl]);

  const computedAppArea = useMemo(() => {
    if (defaultAppArea) return defaultAppArea;
    if (typeof window === "undefined") return "";
    return window.location.pathname;
  }, [defaultAppArea]);

  const firstFieldRef = useRef<HTMLSelectElement | null>(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const submit = () => {
    startTransition(async () => {
      const result = await createReport({
        category,
        title,
        descriptionMarkdown,
        reportedUrl: computedUrl,
        appArea: computedAppArea,
        context: {},
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Report submitted. Thanks for helping us improve ReplaceMe.");
      setTitle("");
      setDescriptionMarkdown("");
      onSubmitted?.();
    });
  };

  return (
    <div className="space-y-5">
      <label className="block space-y-2 text-sm font-semibold text-slate-700">
        Category
        <select
          ref={firstFieldRef}
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as (typeof REPORT_CATEGORIES)[number])
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          disabled={isPending}
        >
          {REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-sm font-semibold text-slate-700">
        Title (optional)
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          placeholder="Short summary (e.g. Apply button does nothing)"
          disabled={isPending}
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-slate-700">
        Description (Markdown supported)
        <textarea
          value={descriptionMarkdown}
          onChange={(e) => setDescriptionMarkdown(e.target.value)}
          rows={7}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          placeholder={
            "Include:\n- Steps to reproduce\n- Expected vs actual behavior\n- Screenshots/recordings (links)\n- Anything you think we should know"
          }
          disabled={isPending}
        />
        <p className="text-xs font-medium text-slate-500">
          We automatically attach the page URL and your account role.
        </p>
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={isPending || descriptionMarkdown.trim().length < 30}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit report"}
      </button>
    </div>
  );
}

