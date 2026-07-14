import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

/**
 * Shown when MAINTENANCE_MODE=1. Outside public layout so header/footer APIs are not required.
 */
export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">We’ll be right back</h1>
      <p className="max-w-md text-sm text-slate-600">
        Replaceme is undergoing scheduled maintenance. Please try again shortly.
        Webhooks and health checks remain available for operators.
      </p>
      <Link
        href="/api/health"
        className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline"
      >
        Status check
      </Link>
    </main>
  );
}
