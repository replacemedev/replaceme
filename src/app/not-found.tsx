import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center bg-slate-50/50 px-4 py-12">
      <div className="flex justify-center mb-2">
        <NavBrand homeHref="/" compact />
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs text-[#006e2f] border border-slate-100">
        <MapPinOff className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Page not found</h2>
        <p className="max-w-md text-sm font-medium text-slate-500">
          This page doesn't exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#005c26] transition-colors cursor-pointer"
      >
        Back to home
      </Link>
    </div>
  );
}
