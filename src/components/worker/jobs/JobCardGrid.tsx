"use client";

import { ReactNode } from "react";

interface JobCardGridProps {
  children: ReactNode;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function JobCardGrid({
  children,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: JobCardGridProps) {
  return (
    <section>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">{children}</ul>

      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#006e2f] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className="flex gap-1" aria-hidden>
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-pulse [animation-delay:300ms]" />
            </span>
            Loading more opportunities...
          </button>
        </div>
      )}
    </section>
  );
}
