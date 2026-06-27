import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#ebfdf2] text-[#006e2f] mb-4">
        {icon}
      </div>
      {title && (
        <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      )}
      <p className="text-slate-500 font-medium text-sm mb-5 leading-relaxed max-w-sm">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
