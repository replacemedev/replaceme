"use client";

import { ChevronLeft } from "lucide-react";

interface MobileChatBackButtonProps {
  onBack: () => void;
  label?: string;
}

export function MobileChatBackButton({
  onBack,
  label = "Messages",
}: MobileChatBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="lg:hidden inline-flex items-center gap-1 -ml-1 mr-1 p-1.5 rounded-lg text-slate-600 hover:text-[#006e2f] hover:bg-slate-50 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
      aria-label={`Back to ${label}`}
    >
      <ChevronLeft className="h-5 w-5" aria-hidden />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
