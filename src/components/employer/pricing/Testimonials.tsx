"use client";

import React from "react";
import type { TestimonialItem } from "@/types/employer/billing";

const fallbackTestimonials: TestimonialItem[] = [
  {
    quote: "We found our lead developer within two days of upgrading to Essential. The quality of applicants and the instant posting feature saved us weeks of recruiting time.",
    author: "Sarah J.",
    role: "CTO",
    company: "TechFlow",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    quote: "The Discovery plan was perfect for dipping our toes in. Once we saw the talent pool, moving to Essential was the easiest decision we made all year.",
    author: "Michael R.",
    role: "Founder",
    company: "Elevate",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    quote: "Upgrading to the Professional plan was a no-brainer. The unlimited job posts and priority support make scaling our entire remote department effortless.",
    author: "Elena V.",
    role: "HR Director",
    company: "Nexus",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
];

interface TestimonialsProps {
  items?: TestimonialItem[];
}

export function Testimonials({ items }: TestimonialsProps) {
  const testimonials = items?.length ? items : fallbackTestimonials;

  if (testimonials.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 bg-[#f8fafe]">
      {/* Centered Title */}
      <h3 className="text-2xl md:text-3xl font-extrabold text-[#0d1e36] text-center mb-16 tracking-tight">
        Trusted by Forward-Thinking Employers
      </h3>
      
      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-8 rounded-3xl bg-white border border-gray-100/80 shadow-md relative hover:shadow-lg transition-all duration-300"
          >
            {/* Quote Mark SVG/Icon */}
            <div className="text-5xl text-[#10b981]/10 font-serif absolute top-4 left-6 select-none pointer-events-none">
              “
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10 pt-4">
              <p className="text-gray-600 text-sm font-semibold leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            {/* Author Block */}
            <div className="mt-8 flex items-center gap-3.5 border-t border-gray-50 pt-6">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.author}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {item.author.charAt(0)}
                </span>
              )}
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.author}</h4>
                <p className="text-[11px] font-bold text-gray-400">
                  {item.role}, {item.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
