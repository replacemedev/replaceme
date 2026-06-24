"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import {
  DEFAULT_SAVED_JOB_SORT,
  SAVED_JOB_SORT_LABELS,
  SAVED_JOB_SORT_OPTIONS,
  type SavedJobSortOption,
} from "@/types/saved-jobs";

interface SavedJobsHeaderProps {
  q: string;
  sort: SavedJobSortOption;
}

export function SavedJobsHeader({ q, sort }: SavedJobsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback(
    (nextQ: string, nextSort: SavedJobSortOption) => {
      const params = new URLSearchParams();
      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextSort !== DEFAULT_SAVED_JOB_SORT) params.set("sort", nextSort);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <header className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
        Saved Jobs
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-2xl">
        Review and manage positions you&apos;ve bookmarked for later application.
      </p>

      <div
        className={`mt-6 flex flex-col sm:flex-row gap-3 ${isPending ? "opacity-70" : ""}`}
      >
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search saved jobs</span>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by title, company, or location…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-1"
            onChange={(e) => {
              const value = e.target.value;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                pushParams(value, sort);
              }, 350);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (debounceRef.current) clearTimeout(debounceRef.current);
                pushParams(e.currentTarget.value, sort);
              }
            }}
          />
        </label>

        <label className="relative shrink-0 sm:w-56">
          <span className="sr-only">Sort saved jobs</span>
          <select
            name="sort"
            defaultValue={sort}
            className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-1 cursor-pointer"
            onChange={(e) => {
              pushParams(q, e.target.value as SavedJobSortOption);
            }}
          >
            {SAVED_JOB_SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SAVED_JOB_SORT_LABELS[option]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            aria-hidden
          />
        </label>
      </div>
    </header>
  );
}
