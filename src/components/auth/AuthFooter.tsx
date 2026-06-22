import React from "react";
import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="w-full text-center py-4 border-t border-slate-100 mt-6 text-xs text-slate-400 font-medium select-none">
      <div className="flex justify-center items-center gap-3 mb-1.5">
        <Link href="/terms" className="hover:text-slate-600 hover:underline transition-colors">
          Terms of Service
        </Link>
        <span className="text-slate-300">•</span>
        <Link href="/privacy" className="hover:text-slate-600 hover:underline transition-colors">
          Privacy Policy
        </Link>
        <span className="text-slate-300">•</span>
        <Link href="/help" className="hover:text-slate-600 hover:underline transition-colors">
          Help
        </Link>
      </div>
      <p>© {new Date().getFullYear()} Replace Me. All rights reserved.</p>
    </footer>
  );
}
