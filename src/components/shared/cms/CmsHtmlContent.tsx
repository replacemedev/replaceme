import type { ReactNode } from "react";

interface CmsHtmlContentProps {
  html?: string | null;
  fallback: ReactNode;
  className?: string;
}

export function CmsHtmlContent({ html, fallback, className }: CmsHtmlContentProps) {
  if (html?.trim()) {
    return (
      <div
        className={className ?? "prose prose-slate max-w-none"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <>{fallback}</>;
}
