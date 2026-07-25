"use client";

import { useState, useTransition } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminApplicationResumeSignedUrl } from "@/actions/admin/applications";

interface OpenResumeButtonProps {
  applicationId: string;
  /** Pre-signed URL from the server (preferred). */
  initialUrl?: string | null;
}

/**
 * Opens a private resume via a signed Storage URL.
 * Safari-safe: opens a blank tab during the user gesture, then navigates after the async sign.
 */
export function OpenResumeButton({
  applicationId,
  initialUrl,
}: OpenResumeButtonProps) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const openResume = () => {
    if (initialUrl) {
      window.open(initialUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Open during the click gesture so Safari allows the new tab after await.
    const popup = window.open("about:blank", "_blank");
    setBusy(true);
    startTransition(async () => {
      try {
        const result = await getAdminApplicationResumeSignedUrl(applicationId);
        if (!result.success) {
          popup?.close();
          toast.error(result.error);
          return;
        }
        if (popup) {
          popup.opener = null;
          popup.location.href = result.url;
        } else {
          window.open(result.url, "_blank", "noopener,noreferrer");
        }
      } catch {
        popup?.close();
        toast.error("Failed to open resume");
      } finally {
        setBusy(false);
      }
    });
  };

  const loading = busy || pending;

  return (
    <button
      type="button"
      onClick={openResume}
      disabled={loading}
      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <FileText className="h-4 w-4" aria-hidden />
      )}
      {loading ? "Opening…" : "Open resume"}
      {!loading ? <ExternalLink className="h-3.5 w-3.5" aria-hidden /> : null}
    </button>
  );
}
