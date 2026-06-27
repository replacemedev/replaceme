"use client";

import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="p-0.5 rounded transition-colors disabled:opacity-50"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            className={`h-6 w-6 ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
