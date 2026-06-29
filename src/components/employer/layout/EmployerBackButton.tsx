"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface EmployerBackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function EmployerBackButton({
  fallbackHref = "/employer/dashboard",
  label = "Back",
  className = "",
}: EmployerBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/25 focus-visible:ring-offset-2 ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

