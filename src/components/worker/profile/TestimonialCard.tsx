"use client";

import React from "react";
import { Star } from "lucide-react";
import { EmployerTestimonial } from "@/types/worker-profile";
import { formatFullName } from "@/lib/format/name";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { LogoImage } from "@/components/shared/media/LogoImage";

interface TestimonialCardProps {
  testimonial: EmployerTestimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const companyDetails = [
    testimonial.employer_role,
    testimonial.company_name,
  ]
    .filter(Boolean)
    .join(", ");

  const fullName =
    formatFullName(
      testimonial.employer_first_name,
      testimonial.employer_last_name
    ) || "Employer Partner";

  const initials = testimonial.employer_first_name
    ? testimonial.employer_first_name[0].toUpperCase()
    : "E";

  const rating = Math.min(Math.max(testimonial.rating, 0), 5);
  const roundedRating = Math.round(rating);
  const companyLabel = testimonial.company_name || fullName;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-shadow duration-200">
      {/* Author Row */}
      <div className="flex items-center gap-3.5 select-none">
        <div className="relative size-10 shrink-0 aspect-square overflow-hidden rounded-full border border-slate-200/50 bg-[#006e2f]/10">
          {testimonial.company_logo ? (
            <LogoImage
              src={testimonial.company_logo}
              alt={`${testimonial.company_name} Logo`}
              label={companyLabel}
              sizePx={40}
              rounded="full"
              colorClass="bg-[#006e2f]/10 text-[#006e2f]"
            />
          ) : (
            <AvatarImage
              src={null}
              alt={fullName}
              initials={initials}
              size="xs"
              containerClassName="h-10 w-10 min-h-10 min-w-10 bg-[#006e2f]/10"
            />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-slate-800 truncate">
            {fullName}
          </h4>
          {companyDetails ? (
            <p className="text-[10px] font-bold text-slate-400 truncate">
              {companyDetails}
            </p>
          ) : null}
        </div>
      </div>

      {/* Stars Rating row (rendered in Brand Green) */}
      <div className="flex items-center gap-1 select-none">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            size={12}
            className={`${
              idx < roundedRating
                ? "text-[#006e2f] fill-[#006e2f]"
                : "text-slate-200 fill-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Testimonial Quote in Italics */}
      <p className="text-[11px] font-semibold text-slate-600 italic leading-relaxed">
        &ldquo;{testimonial.review_text}&rdquo;
      </p>
    </div>
  );
}
