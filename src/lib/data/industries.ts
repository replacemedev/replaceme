import type { DropdownOption } from "@/lib/validations/employer/company";

/** Curated employer industry list (static — no DB table). */
export const EMPLOYER_INDUSTRIES: readonly DropdownOption[] = [
  { label: "BPO & Customer Support", value: "BPO & Customer Support" },
  { label: "Virtual Assistance & Operations", value: "Virtual Assistance & Operations" },
  { label: "Technology & Software", value: "Technology & Software" },
  { label: "Design & Creative Services", value: "Design & Creative Services" },
  { label: "Marketing & Advertising", value: "Marketing & Advertising" },
  { label: "Sales & Business Development", value: "Sales & Business Development" },
  { label: "Finance & Accounting", value: "Finance & Accounting" },
  { label: "Human Resources & Recruiting", value: "Human Resources & Recruiting" },
  { label: "E-commerce & Retail", value: "E-commerce & Retail" },
  { label: "Education & E-learning", value: "Education & E-learning" },
  { label: "Healthcare & Life Sciences", value: "Healthcare & Life Sciences" },
  { label: "Legal & Compliance", value: "Legal & Compliance" },
  { label: "Real Estate & Property", value: "Real Estate & Property" },
  { label: "Media & Content", value: "Media & Content" },
  { label: "Travel & Hospitality", value: "Travel & Hospitality" },
  { label: "Non-profit & NGO", value: "Non-profit & NGO" },
  { label: "Other", value: "Other" },
] as const;

export const HIRING_REGIONS: readonly DropdownOption[] = [
  { label: "Philippines", value: "PH" },
  { label: "United States", value: "US" },
  { label: "Australia", value: "AU" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "UK" },
  { label: "European Union", value: "EU" },
  { label: "Singapore", value: "SG" },
  { label: "Global / remote-anywhere", value: "GLOBAL" },
] as const;

export const HIRING_REGION_VALUES = HIRING_REGIONS.map((r) => r.value) as [
  string,
  ...string[],
];
