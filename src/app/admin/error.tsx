"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="max-w-md text-sm text-slate-500">
        An unexpected error occurred in the admin panel. No technical details are
        shown here for security.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
