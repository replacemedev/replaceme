import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = {
  title: "Forbidden | ReplaceMe",
};

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-[#f8fafe] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-600 mb-6">
          <ShieldX className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Access denied
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          You don&apos;t have permission to view this page. If you believe this is
          an error, contact your administrator.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-lg transition-colors"
        >
          Return to login
        </Link>
      </div>
    </main>
  );
}
