import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center px-4 py-12">
      <div className="flex justify-center mb-2">
        <NavBrand homeHref="/admin/dashboard" compact />
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <MapPinOff className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Page not found</h2>
        <p className="max-w-md text-sm font-medium text-slate-500">
          This page doesn't exist or you don't have access.
        </p>
      </div>
      <Link
        href="/admin/dashboard"
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
