import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";
import { LoginTestimonial } from "./LoginTestimonial";
import type { AuthScreenConfig } from "@/types/page-content";

interface AuthMarketingPanelProps {
  content: AuthScreenConfig;
  variant?: "testimonial" | "brand";
}

export function AuthMarketingPanel({
  content,
  variant = "testimonial",
}: AuthMarketingPanelProps) {
  const hasTestimonial =
    Boolean(content.testimonialQuote?.trim()) &&
    Boolean(content.testimonialName?.trim());

  if (variant === "testimonial" && hasTestimonial) {
    return (
      <LoginTestimonial
        quote={content.testimonialQuote}
        name={content.testimonialName}
        role={content.testimonialRole}
        compact
      />
    );
  }

  if (!content.headline?.trim() && !content.description?.trim()) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" aria-hidden />}
        title="Content not configured"
        description="An administrator can publish marketing copy for this screen in the Admin portal."
      />
    );
  }

  return (
    <div className="max-w-md text-center lg:text-left space-y-3">
      {content.headline ? (
        <p className="text-lg font-bold text-slate-900 leading-snug">
          {content.headline}
        </p>
      ) : null}
      {content.description ? (
        <p className="text-sm text-slate-600 leading-relaxed">
          {content.description}
        </p>
      ) : null}
    </div>
  );
}
