"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";

interface PinToggleProps {
  workerId: string;
  isPinned: boolean;
  onToggle: () => void;
}

export function PinToggle({ workerId, isPinned, onToggle }: PinToggleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      type="button"
      className="p-2.5 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-emerald-600 border border-slate-100 hover:border-red-100 rounded-2xl transition-all duration-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center group"
      title={isPinned ? "Unpin worker" : "Pin worker"}
    >
      <Bookmark
        size={18}
        className={`transition-all duration-200 ${
          isPinned
            ? "fill-emerald-600 group-hover:fill-transparent"
            : hovered
            ? "fill-red-50"
            : ""
        }`}
      />
    </button>
  );
}
