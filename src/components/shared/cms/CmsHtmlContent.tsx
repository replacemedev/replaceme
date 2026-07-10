import type { ReactNode } from "react";
import { sanitizeCmsHtml } from "@/lib/security/sanitize-html";

interface CmsHtmlContentProps {
  html?: string | null;
  fallback: ReactNode;
  className?: string;
}

export function CmsHtmlContent({ html, fallback, className }: CmsHtmlContentProps) {
  if (html?.trim()) {
    const safe = sanitizeCmsHtml(html);
    return (
      <div
        className={className ?? "prose prose-slate max-w-none"}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }
  return <>{fallback}</>;
}
