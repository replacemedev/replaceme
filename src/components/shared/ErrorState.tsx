import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  description: string;
  retryHref?: string;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retryHref,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/80 bg-white p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {retryHref ? (
        <Link
          href={retryHref}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {retryLabel}
        </Link>
      ) : null}
    </div>
  );
}
