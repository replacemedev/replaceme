/**
 * Shared class tokens for employer UI surfaces (Phase F design system).
 * Prefer these over one-off gray/emerald variants.
 */

export const EMPLOYER_SHELL_WIDTH = {
  default: "max-w-container-max",
  content: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
} as const;

export const EMPLOYER_SHELL_PADDING = "px-margin-desktop py-12";

export const EMPLOYER_CARD =
  "rounded-3xl border border-slate-100 bg-white shadow-sm";

export const EMPLOYER_CARD_HOVER =
  "transition-all duration-300 hover:shadow-md hover:border-slate-200/60";

export const EMPLOYER_PAGE_TITLE =
  "text-3xl font-extrabold text-slate-900 tracking-tight leading-none";

export const EMPLOYER_PAGE_SUBHEAD =
  "text-sm text-slate-500 font-medium mt-2 leading-relaxed max-w-2xl";

export const EMPLOYER_SECTION_TITLE =
  "text-xl font-bold text-slate-900 tracking-tight";

export const EMPLOYER_ACCENT = "#006e2f";

export const EMPLOYER_ACCENT_HOVER = "#005c26";

export const EMPLOYER_ACCENT_SOFT = "#ebfdf2";

export const EMPLOYER_ACCENT_MUTED = "#fafdfb";
