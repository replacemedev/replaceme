import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold text-slate-900">Page not found</h2>
      <p className="max-w-md text-sm text-slate-500">
        This admin route does not exist or you do not have access to it.
      </p>
      <Link
        href="/admin/dashboard"
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
