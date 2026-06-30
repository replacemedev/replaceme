"use client";

import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { buildAuthHref } from "@/lib/auth/safe-callback-url";

interface PublicJobAuthWallProps {
  jobId: string;
  variant: "inline" | "sticky";
}

export function PublicJobAuthWall({ jobId, variant }: PublicJobAuthWallProps) {
  const callbackPath = `/jobs/${jobId}`;
  const signUpHref = buildAuthHref("/signup", callbackPath);
  const signInHref = buildAuthHref("/signin", callbackPath);

  const card = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <Lock size={18} strokeWidth={2.25} aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#006e2f]">
            <Sparkles size={12} aria-hidden />
            Free to apply
          </p>
          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Sign in or sign up to continue and apply for this role
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Create a worker profile in minutes. You&apos;ll return here after
            signing in.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0 sm:items-center">
        <Link
          href={signInHref}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-[#006e2f]/30 hover:bg-[#fafdfb] hover:text-[#006e2f] active:scale-[0.98]"
        >
          Sign in
        </Link>
        <Link
          href={signUpHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,110,47,0.25)] transition-all duration-200 hover:bg-[#005c26] active:scale-[0.98]"
        >
          Sign up free
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );

  if (variant === "sticky") {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md md:hidden"
        role="region"
        aria-label="Sign in to apply"
      >
        {card}
      </div>
    );
  }

  return (
    <article
      className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:block lg:p-6"
      role="region"
      aria-label="Sign in to apply"
    >
      {card}
    </article>
  );
}
