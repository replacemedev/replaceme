/** Shared onboarding option lists — use `<select>` when choices are small and fixed. */

export const WORKER_LOCATION_OPTIONS = [
  "Remote",
  "Philippines",
  "Southeast Asia",
  "United States",
  "Europe",
  "Other",
] as const;

export const COMPANY_SIZE_OPTIONS = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
] as const;

export const DEFAULT_SKILL_OPTIONS = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "Vue.js",
  "Angular",
  "Java",
  "Go",
  "SQL",
  "PostgreSQL",
  "UI/UX Design",
  "Figma",
  "DevOps",
  "AWS",
  "Docker",
  "Product Management",
  "Project Management",
  "Marketing",
  "SEO",
  "Content Writing",
  "Customer Support",
  "Data Entry",
  "Sales",
  "Accounting",
] as const;

export const ONBOARDING_SELECT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
