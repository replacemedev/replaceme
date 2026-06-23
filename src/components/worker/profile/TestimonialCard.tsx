"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { EmployerTestimonial } from "@/types/worker-profile";

interface TestimonialCardProps {
  testimonial: EmployerTestimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const companyDetails = [
    testimonial.employer_role,
    testimonial.company_name
  ].filter(Boolean).join(", ");

  const fullName = [
    testimonial.employer_first_name,
    testimonial.employer_last_name
  ].filter(Boolean).join(" ") || "Employer Partner";

  const initials = testimonial.employer_first_name 
    ? testimonial.employer_first_name[0].toUpperCase() 
    : "E";

  const rating = Math.min(Math.max(testimonial.rating, 0), 5);
  const roundedRating = Math.round(rating);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-shadow duration-200">
      
      {/* Author Row */}
      <div className="flex items-center gap-3.5 select-none">
        {/* Initials / Logo Avatar */}
        <div className="relative w-10 h-10 rounded-full shrink-0 border border-slate-200/50 bg-[#006e2f]/10 flex items-center justify-center overflow-hidden">
          {testimonial.company_logo ? (
            <Image
              src={testimonial.company_logo}
              alt={`${testimonial.company_name} Logo`}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#006e2f] font-extrabold text-xs">
              {initials}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-slate-800 truncate">
            {fullName}
          </h4>
          {companyDetails && (
            <p className="text-[10px] font-bold text-slate-400 truncate">
              {companyDetails}
            </p>
          )}
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
